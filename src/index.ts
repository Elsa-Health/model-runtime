import * as distributions from './lib/distributions';
import * as utils from './utils';
import * as T from './public-types';

const betaDist = require('@stdlib/stats/base/dists/beta');
const betaRV = require('@stdlib/random/base/beta');
const bernoulliRV = require('@stdlib/random/base/bernoulli');
const Cauchy = require('@stdlib/stats/base/dists/cauchy').Cauchy;
const normalDist = require('@stdlib/stats/base/dists/normal');
// const stdev = require('@stdlib/stats/base/dists/normal/stdev');
const array2iterator = require('@stdlib/array/to-iterator');
const ns = require('@stdlib/stats/iter');

export { distributions, utils };
const { createBeta } = distributions;
const { isEmpty, isBetaList, mean } = utils;

// Format the patient to do anything that is needed
export const formatPatient = (patient: T.Patient): T.FormattedPatient => {
	return (createSymptomProgression(patient) as unknown) as T.FormattedPatient;
};

/**
 * Given the patient presentation, order the symptoms in order of presentation to create a coherent flow of symptoms
 *
 * @param {patient:T.Patient} The patient object containing the symptoms
 * @returns {T.FormattedPatient} The patient object with the symptoms ordered and formated to show progression
 **/
export const createSymptomProgression = (
	patient: T.Patient
): Partial<T.FormattedPatient> => {
	// 1. Sort symptoms by duration (from longest to shortest)
	const sortedSymptoms = patient.symptoms.sort(
		(a, b) => b.duration - a.duration
	);

	// 2. Calculate the deltas between each symptom and the longest symptom and add those as the timeToOnset
	const formattedSymptoms = sortedSymptoms.reduce((acc, curr, currIdx) => {
		if (currIdx === 0) {
			return [...acc, { ...curr, timeToOnset: 0 }];
		}
		const timeToOnset = acc[acc.length - 1].duration - curr.duration;
		return [...acc, { ...curr, timeToOnset }];
	}, [] as T.FormattedPatientSymptom[]);

	return { ...patient, symptoms: formattedSymptoms };
};

/*
 * Create a patient object given the parameters
 *
 * @param {sex: T.Sex}
 * @param {age:number}
 * @param {symptoms: T.PatientSymptom[]}
 * @param {signs: any[]}
 *
 * @returns T.Patient
 */
export function createPatient(
	sex: T.Sex,
	age: number,
	symptoms: T.PatientSymptom[],
	signs: any[]
): T.Patient {
	return {
		age,
		sex,
		symptoms,
		signs,
	};
}

// for each beta random variable, create a distribution and take the mean of it and multiply the resulting "p" of each one of them.
// TODO: Figure out the penalty variables
export const getBetaListMatch = (stochastic: boolean) => (
	rule: T.BetaCombinationRule = 'and'
) => (modelSymptoms: T.Beta[]) => (patientSymptoms: string[]) => {
	// P(A and B) = P(A) x P(B | A) is probably a better approach here because the events are not independent
	function getBetaP(alpha: number, beta: number, isPresent: boolean): number {
		const dist = betaDist.Beta(alpha, beta);
		const p = isPresent ? dist.mean : 1 - dist.mean;
		return p;
	}

	function getRandomBetaP(
		alpha: number,
		beta: number,
		isPresent: boolean
	): number {
		const rand = betaRV.factory(alpha || 1, beta || 1);
		return isPresent ? rand() : 1 - rand();
	}

	function isSymptomPresent(
		patientSymptoms: string[],
		symptom: T.Beta
	): boolean {
		if (symptom._.combination === true && Array.isArray(symptom.name)) {
			return symptom.name
				.map(n => patientSymptoms.includes(n))
				.every(v => v);
		} else {
			return patientSymptoms.includes(symptom.name as string);
		}
	}

	const getP = stochastic ? getRandomBetaP : getBetaP;

	// If there are no patient symptoms and the model is also empty, then p = 1
	if (isEmpty(modelSymptoms) && isEmpty(patientSymptoms)) {
		return 1;
	}

	// HACK: If the patient has symptoms but the model defines none, then just return 1% likelihood(???)
	if (isEmpty(modelSymptoms) && !isEmpty(patientSymptoms)) {
		return 0.01;
	}

	if (rule === 'and') {
		return modelSymptoms.reduce((acc, curr) => {
			const isPresent = isSymptomPresent(patientSymptoms, curr);
			const p = getP(curr.alpha, curr.beta, isPresent);
			return acc * p;
			// return acc + p; // take mean later??
		}, 1);
	} else {
		const red = modelSymptoms.reduce(
			(acc, curr) => {
				const isPresent = isSymptomPresent(patientSymptoms, curr);
				const p = getP(curr.alpha, curr.beta, isPresent);
				return {
					sum: acc.sum + p,
					prod: acc.prod * p,
				};
			},
			{ sum: 0, prod: 1 }
		);

		return red.sum - red.prod;
	}
};

export const getCategoricalMatch = (stochastic: boolean) => (
	variable: T.Categorical
) => (patientPresentation: string) => {
	const pidx = variable.ns.indexOf(patientPresentation);
	const p = variable.ps[pidx] || 0;

	if (stochastic) {
		const rand = bernoulliRV.factory(p);
		return rand();
	}

	return p || 0;
};

// Interpreter: model => patient => matchPercentage
type PatientMatch = number; //Omit<Beta, '_' | 'name'>;
type InterpretFunction = (
	stochastic: boolean
) => (model: T.ConditionModel) => (patient: T.FormattedPatient) => PatientMatch;

// TODO: Add support for symptoms that are not expected to be presenting yet based on symptom presentation
export const interpret: InterpretFunction = (
	stochastic = false
) => model => patient => {
	// Compare all the symptoms that the patient and the model have
	const assesment = patient.symptoms.map(psymptom => {
		const modelSymptoms = model.symptoms.find(
			msymptom => msymptom.name === psymptom.name
		);

		// Could not find the symptom in th emodel
		if (modelSymptoms === undefined) {
			// TODO: handle patient has extra symptoms (penalize?)
			return;
		}

		const locationMatch = getBetaListMatch(stochastic)('or')(
			modelSymptoms.locations
		)(psymptom.locations);

		const durationMatch = ((tolerance: number) => {
			const { mean, sd } = modelSymptoms.duration;
			const x = psymptom.duration;
			const cDist = new normalDist.Normal(mean, sd);
			if (x <= mean) {
				return cDist.cdf(x, mean, sd) * 2 * tolerance;
			} else {
				return 1 - cDist.cdf(x, mean, sd) * 2 * tolerance;
			}
		})(0.75);

		const onsetMatch = getCategoricalMatch(stochastic)(modelSymptoms.onset)(
			psymptom.onset
		);

		const natureMatch = (() => {
			if (isEmpty(modelSymptoms.nature) && isEmpty(psymptom.nature)) {
				// Match made in heaven!
				return 1;
			}

			if (
				isBetaList(modelSymptoms.nature) ||
				(isEmpty(modelSymptoms.nature) && !isEmpty(psymptom.nature))
			) {
				// Simple list of betas
				// Should this be an "and" by default??
				return getBetaListMatch(stochastic)('or')(
					modelSymptoms.nature as T.Beta[]
				)(psymptom.nature);
			}

			throw new Error("Can't handle non beta variables for now");
		})();

		const periodicityMatch = getCategoricalMatch(stochastic)(
			modelSymptoms.periodicity
		)(psymptom.periodicity);

		const aggravatorsMatch = getBetaListMatch(stochastic)('or')(
			modelSymptoms.aggravators
		)(psymptom.aggravators);
		const relieversMatch = getBetaListMatch(stochastic)('or')(
			modelSymptoms.relievers
		)(psymptom.relievers);

		const timeToOnsetMatch = ((tolerance: number) => {
			// We are treating the timeToOnset as a "folded" cauchy about the location. The tolerance helps scale things. MAJOR MAJOR MAJOR HACK!! MUST REVIEW!!
			const { location, scale } = modelSymptoms.timeToOnset;
			const cDist = new Cauchy(location, scale);
			const x = psymptom.timeToOnset;
			if (x <= location) {
				return cDist.cdf(x, location, scale) * 2 * tolerance;
			} else {
				return 1 - cDist.cdf(x, location, scale) * 2 * tolerance;
			}
		})(0.75);

		return {
			locationMatch,
			durationMatch,
			onsetMatch,
			natureMatch,
			periodicityMatch,
			aggravatorsMatch,
			relieversMatch,
			timeToOnsetMatch,
		};
	});

	const assessmentResults = mean(
		assesment
			.filter(r => r !== undefined)
			// @ts-ignore
			.map(res => mean(Object.values(res)))
	);
	return assessmentResults;
};

export const sample = (count: number) => (fn: Function): T.Normal => {
	const samples = [];
	for (let i = 0; i < count; i++) {
		samples.push(fn());
	}

	const arr = array2iterator(samples);
	const std = ns.iterstdev(arr);

	return distributions.createNormal('results', mean(samples), std);
};

export const interpretRandom = (count: number = 1000) => (
	model: T.ConditionModel
) => (patient: T.FormattedPatient): T.Normal => {
	return sample(count)(() => interpret(true)(model)(patient));
};

// @ts-expect-error
function combineBetas(name = 'beta', betas: Array<Beta>): Beta {
	const rawSum = betas.reduce(
		(acc, beta) => {
			return {
				alpha: acc.alpha + beta.alpha,
				beta: acc.beta + beta.beta,
			};
		},
		{ alpha: 0, beta: 0 }
	);

	rawSum.alpha = rawSum.alpha / betas.length;
	rawSum.beta = rawSum.beta / betas.length;

	return createBeta(name, rawSum.alpha, rawSum.beta);
}

// TODO: Create the time to onset right here
// TODO: Consider both present and absent symptoms
// TODO: Think about running each model multiple times while sampling from each of the distributions to get some error bounds

export * from './public-types';
