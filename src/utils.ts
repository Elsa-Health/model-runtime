// import _, { random } from 'lodash';

import {
	createBeta,
	createCategorical,
	createCauchy,
	createNormal,
} from './lib/distributions';

function randomIntFromInterval(min: number, max: number): number {
	// min and max included
	return Math.floor(Math.random() * (max - min + 1) + min);
}

function upperFirst(str: string): string {
	return str.charAt(0).toUpperCase() + str.slice(1);
}

export const randomSymptom = (name: string): Symptom => {
	const rand = Math.random();
	const duration = createNormal(
		'duration',
		randomIntFromInterval(8, 15),
		randomIntFromInterval(2, 8)
	);
	return {
		name,
		locations: [
			createBeta('face', 1000, 10),
			createBeta('neck', 100, 1000),
		],
		duration,
		onset: createCategorical(
			'onset',
			['gradual', 'sudden'],
			[rand, 1 - rand]
		),
		nature: [],
		periodicity: createCategorical('periodicity', [], []),
		aggravators: [],
		relievers: [
			createBeta('paracetamol', 100, 10),
			createBeta('sleeping', 90, 8),
		],
		timeToOnset: createCauchy(
			'timeToOnset',
			// randomIntFromInterval(duration.mean, duration.mean + 3),
			2,
			// Math.max(1, randomIntFromInterval(0, duration.mean))
			0.1
		),
	};
};

export const searchForSymptom = (symptomsList: Record<string, any>[]) => (
	resultsCount = 4
) => (name: string) => {
	return symptomsList
		.filter(
			sy =>
				sy.symptom.includes(name) ||
				sy.tags.filter((t: string) => t.includes(name)).length > 0
		)
		.slice(0, resultsCount);
};

export const friendlySymptomName = (name: string) => {
	return upperFirst(name.split('-').join(' '));
};

export const toggleCondition = (
	conditions: Condition[],
	condition: Condition
) => {
	const condIdx = conditions.findIndex(c => c.name === condition.name);
	if (condIdx > -1) {
		return conditions.filter(c => c.name !== condition.name);
	}
	return [...conditions, condition];
};

export const isBetaList = (list: any[]): boolean => {
	return list.some(val => val?._?.type !== 'beta');
};

export const isWeibullList = (list: any[]): boolean => {
	return list.some(val => val?._?.type !== 'weibull');
};

export const isEmpty = (list: any[]): boolean => {
	return list.length === 0;
};

export const mean = (list: number[]): number => {
	return list.reduce((a, b) => a + b, 0) / list.length;
};
