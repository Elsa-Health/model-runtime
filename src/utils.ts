import * as T from './public-types';
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

export const randomSymptom = (name: string): T.Symptom => {
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
		age: {
			adolescent: createBeta('adolescent', 100, 1),
			adult: createBeta('adult', 100, 1),
			child: createBeta('child', 100, 1),
			newborn: createBeta('newborn', 100, 1),
			senior: createBeta('senior', 100, 1),
			infant: createBeta('infant', 100, 1),
			toddler: createBeta('toddler', 100, 1),
			youngAdult: createBeta('youngAdult', 100, 1),
		},
		sex: {
			female: createBeta('female', 100, 1),
			male: createBeta('male', 100, 1),
		},
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

export const friendlySymptomName = (name: string) => {
	return upperFirst(name.split('-').join(' '));
};

export const toggleCondition = (
	conditions: T.Condition[],
	condition: T.Condition
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

// type Range = [number, number];

const ageMap: any[] = [
	['newborn', [0, 0.166]],
	['infant', [0.166, 1.0]],
	['toddler', [1.0, 4.0]],
	['child', [4.0, 12.0]],
	['adolescent', [12.0, 18.0]],
	['youngAdult', [18.0, 35.0]],
	['adult', [35, 65.0]],
	['senior', [65, 200.0]],
];

export const convertAgeToGroup = (age: number): string => {
	const group = ageMap.find(m => age >= m[1][0] && age < m[1][1]);

	if (group === undefined || age < 0) {
		return 'n/a';
	}
	return group[0];
};
