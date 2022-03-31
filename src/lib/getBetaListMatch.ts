import * as T from '../public-types';
import { isEmpty } from '../utils';
const betaDist = require('@stdlib/stats/base/dists/beta');
const betaRV = require('@stdlib/random/base/beta');

// for each beta random variable, create a distribution and take the mean of it and multiply the resulting "p" of each one of them.
// TODO: Figure out the penalty variables
export const getBetaListMatch = (stochastic: boolean) => (
	rule: T.BetaCombinationRule = 'and'
) => (modelSymptoms: T.Beta[]) => (patientSymptoms: string[]) => {
	// P(A and B) = P(A) x P(B | A) is probably a better approach here because the events are not independent

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

		// (red.sum === 0 || red.prod === red.sum) && console.log({ red });

		if (modelSymptoms.length === 1) return red.sum;

		return red.sum - red.prod;
	}
};

export function getBetaP(
	alpha: number,
	beta: number,
	isPresent: boolean
): number {
	const dist = betaDist.Beta(alpha, beta);
	const p = isPresent ? dist.mean : 1 - dist.mean;
	return p;
}

export function getRandomBetaP(
	alpha: number,
	beta: number,
	isPresent: boolean
): number {
	const rand = betaRV.factory(alpha || 1, beta || 1);
	return isPresent ? rand() : 1 - rand();
}

export function isSymptomPresent(
	patientSymptoms: string[],
	symptom: T.Beta
): boolean {
	if (symptom._.combination === true && Array.isArray(symptom.name)) {
		return (symptom.name as string[])
			?.map(n => patientSymptoms.includes(n))
			.every(v => v);
	} else {
		return patientSymptoms.includes(symptom.name as string);
	}
}
