import * as T from '../public-types';
import { isEmpty } from '../utils';
const betaDist = require('@stdlib/stats/base/dists/beta');
const betaRV = require('@stdlib/random/base/beta');

// for each beta random variable, create a distribution and take the mean of it and multiply the resulting "p" of each one of them.
// TODO: Figure out the penalty variables
export const getBetaListMatch = (stochastic: boolean) => (
	rule: T.BetaCombinationRule = 'and'
) => (betaList: T.Beta[]) => (valuesList: string[], tolerance = 0.8) => {
	// P(A and B) = P(A) x P(B | A) is probably a better approach here because the events are not independent

	const getP = stochastic ? getRandomBetaP : getBetaP;

	// If there are no patient symptoms and the model is also empty, then p = 1
	if (isEmpty(betaList) && isEmpty(valuesList)) {
		return 1;
	}

	// HACK: If the patient has symptoms but the model defines none, then just return 1% likelihood(???)
	if (isEmpty(betaList) && !isEmpty(valuesList)) {
		return 0.01;
	}
	// FIXME: Support isPresentButNotExpected symptm as well
	const penalty = ((tol: number) => {
		const expected = betaList.map(b => b.name);
		const unexpected = valuesList.filter(v => !expected.includes(v));

		return Math.pow(tol, unexpected.length);
	})(tolerance);

	// console.log({ penalty, tolerance });

	if (rule === 'and') {
		return (
			betaList.reduce((acc, curr) => {
				const isPresent = isSymptomPresent(valuesList, curr);
				const p = getP(curr.alpha, curr.beta, isPresent);
				return acc * p;
				// return acc + p; // take mean later??
			}, 1) * penalty
		);
	} else {
		const red = betaList.reduce(
			(acc, curr) => {
				// Is expected symptom present?
				const isPresent = isSymptomPresent(valuesList, curr);
				const p = getP(curr.alpha, curr.beta, isPresent);
				return {
					sum: acc.sum + p,
					prod: acc.prod * p,
				};
			},
			{ sum: 0, prod: 1 }
		);

		if (betaList.length === 1) return red.sum * penalty;

		// console.log({
		// 	pre: red.sum - red.prod,
		// 	post: (red.sum - red.prod) * penalty,
		// });

		return (red.sum - red.prod) * penalty;
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

/**
 * Checks whether a beta value is present in a given list of names
 *
 * @export
 * @param {string[]} valuesList
 * @param {T.Beta} betaVar
 * @return {*}  {boolean}
 */
export function isSymptomPresent(
	valuesList: string[],
	betaVar: T.Beta
): boolean {
	if (betaVar._.combination === true && Array.isArray(betaVar.name)) {
		return (betaVar.name as string[])
			?.map(n => valuesList.includes(n))
			.every(v => v);
	} else {
		return valuesList.includes(betaVar.name as string);
	}
}
