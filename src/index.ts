import * as distributions from './lib/distributions';
import * as utils from './utils';
import * as T from './public-types';
import {
	getBetaListMatch,
	getBetaP,
	getRandomBetaP,
} from './lib/getBetaListMatch';

// const betaDist = require('@stdlib/stats/base/dists/beta');
// const betaRV = require('@stdlib/random/base/beta');
const bernoulliRV = require('@stdlib/random/base/bernoulli');
const Cauchy = require('@stdlib/stats/base/dists/cauchy').Cauchy;
const normalDist = require('@stdlib/stats/base/dists/normal');
// const stdev = require('@stdlib/stats/base/dists/normal/stdev');
const array2iterator = require('@stdlib/array/to-iterator');
const ns = require('@stdlib/stats/iter');

export { distributions, utils };
const { createBeta } = distributions;
const { isEmpty, isBetaList, mean, convertAgeToGroup } = utils;

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

// TODO: Add support for symptoms that are not expected to be presenting "yet" based on symptom presentation
export const interpret: InterpretFunction = (
	stochastic = false
) => model => patient => {
	const patientAgeGroup: T.AgeGroup = convertAgeToGroup(
		patient.age || 18
	) as T.AgeGroup;
	// Compare all the symptoms that the patient and the model have
	const assesment: T.SymptomMatch[] =
		patient.symptoms?.map(psymptom => {
			const modelSymptoms = model.symptoms.find(
				msymptom => msymptom.name === psymptom.name
			);

			// Could not find the symptom in th emodel
			if (modelSymptoms === undefined) {
				// TODO: handle patient has extra symptoms (penalize?)
				// console.log("")
				return {
					sexMatch: 0,
					ageMatch: 0,
					locationMatch: 0,
					aggravatorsMatch: 0,
					relieversMatch: 0,
					durationMatch: 0,
					natureMatch: 0,
					onsetMatch: 0,
					periodicityMatch: 0,
					timeToOnsetMatch: 0,
				};
			}

			const getP = stochastic ? getRandomBetaP : getBetaP;
			const ageMatch = (() => {
				const group = modelSymptoms.age[patientAgeGroup];

				// console.log({ group, patientAgeGroup, age: patient.age });
				return getP(group.alpha, group.beta, true);
			})();
			const sexMatch = (() => {
				const pSex = modelSymptoms.sex[patient.sex];

				return getP(pSex.alpha, pSex.beta, true);
			})();

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

			const onsetMatch = getCategoricalMatch(stochastic)(
				modelSymptoms.onset
			)(psymptom.onset);

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
					)(psymptom.nature, 0.5);
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
				sexMatch,
				ageMatch: ageMatch * sexMatch,
				locationMatch: locationMatch * sexMatch,
				durationMatch: durationMatch * sexMatch,
				onsetMatch: onsetMatch * sexMatch,
				natureMatch: natureMatch * sexMatch,
				periodicityMatch: periodicityMatch * sexMatch,
				aggravatorsMatch: aggravatorsMatch * sexMatch,
				relieversMatch: relieversMatch * sexMatch,
				timeToOnsetMatch: timeToOnsetMatch * sexMatch,
			};
		}) || [];

	const assessmentScores = assesment
		.filter(r => r !== undefined)
		.map(res => utils.symptomScore(res));

	return mean(assessmentScores);
};

export const sample = (count: number) => (fn: Function): T.Normal => {
	const samples = [];
	for (let i = 0; i < count; i++) {
		samples.push(fn());
	}

	const arr = array2iterator(samples);
	const std = ns.iterstdev(arr);

	return distributions.createNormal('results', mean(samples), std || 0.001);
};

export const interpretRandom = (count: number = 1000) => (
	model: T.ConditionModel
) => (patient: T.FormattedPatient): T.Normal => {
	return sample(count)(() => interpret(true)(model)(patient));
};

export function combineBetas(name = 'beta', betas: Array<T.Beta>): T.Beta {
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
