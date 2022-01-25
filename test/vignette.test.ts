import { createPatient, formatPatient, interpret } from '../src';
// import {
// 	createBeta,
// 	createCategorical,
// 	createCauchy,
// 	createNormal,
// } from '../src/lib/distributions';

// type Symptom = {
// 	name: string;
// 	locations: Beta[];
// 	//   duration: Weibull;
// 	duration: Normal;
// 	onset: Categorical;
// 	nature: (Beta | Weibull | Change)[];
// 	periodicity: Categorical;
// 	aggravators: Beta[];
// 	relievers: Beta[];
// 	timeToOnset: Cauchy;
// };

const testModel = {
	condition: 'tinea-nigra',
	symptoms: [
		{
			name: 'cough',
			locations: [],
			duration: {
				name: 'duration',
				mean: 1825,
				sd: 1,
				_: {
					dist: 'normal' as 'normal',
				},
				variance: 4,
			},
			onset: {
				name: 'onset',
				ps: [0.5, 0.5],
				ns: ['gradual', 'sudden'],
				_: {
					dist: 'categorical' as 'categorical',
				},
			},
			nature: [
				{
					name: 'dry',
					alpha: 80,
					beta: 20,
					_: {
						dist: 'beta' as 'beta',
					},
				},
				{
					name: 'jelly-like-sputum',
					alpha: 1,
					beta: 1,
					_: {
						dist: 'beta' as 'beta',
					},
				},
			],
			periodicity: {
				name: 'periodicity',
				ps: [0, 0.25, 0.25, 0.5],
				ns: ['morning', 'night', 'intermittent', 'non-specific'],
				_: {
					dist: 'categorical' as 'categorical',
				},
			},
			aggravators: [
				{
					name: 'dust',
					alpha: 1,
					beta: 1,
					_: {
						dist: 'beta' as 'beta',
					},
				},
				{
					name: 'pollen',
					alpha: 1,
					beta: 1,
					_: {
						dist: 'beta' as 'beta',
					},
				},
				{
					name: 'smoke',
					alpha: 1,
					beta: 1,
					_: {
						dist: 'beta' as 'beta',
					},
				},
				{
					name: 'laying-down',
					alpha: 1,
					beta: 1,
					_: {
						dist: 'beta' as 'beta',
					},
				},
			],
			relievers: [
				{
					name: 'antihistamines',
					alpha: 1100,
					beta: 10,
					_: {
						dist: 'beta' as 'beta',
					},
				},
			],
			timeToOnset: {
				name: 'timeToOnset',
				location: 2.5,
				scale: 1.5,
				_: {
					dist: 'cauchy' as 'cauchy',
				},
			},
		},
		{
			name: 'fever',
			locations: [],
			duration: {
				name: 'duration',
				mean: 17,
				sd: 1,
				_: {
					dist: 'normal' as 'normal',
				},
				variance: 3,
			},
			onset: {
				name: 'onset',
				ps: [0.85, 0.15],
				ns: ['gradual', 'sudden'],
				_: {
					dist: 'categorical' as 'categorical',
				},
			},
			nature: [
				{
					name: 'low-grade',
					alpha: 10,
					beta: 90,
					_: {
						dist: 'beta' as 'beta',
					},
				},
				{
					name: 'high-grade',
					alpha: 90,
					beta: 10,
					_: {
						dist: 'beta' as 'beta',
					},
				},
			],
			periodicity: {
				name: 'periodicity',
				ps: [0.1, 0, 0.8, 0, 0, 0.1, 0],
				ns: [
					'persistent',
					'intermittent',
					'relapsing',
					'step-ladder',
					'remittent',
					'non-specific',
					'night',
				],
				_: {
					dist: 'categorical' as 'categorical',
				},
			},
			aggravators: [
				{
					name: 'pollen',
					alpha: 10,
					beta: 90,
					_: {
						dist: 'beta' as 'beta',
					},
				},
				{
					name: 'crying',
					alpha: 10,
					beta: 90,
					_: {
						dist: 'beta' as 'beta',
					},
				},
				{
					name: 'light-activity',
					alpha: 1,
					beta: 99,
					_: {
						dist: 'beta' as 'beta',
					},
				},
				{
					name: 'cold-weather',
					alpha: 2,
					beta: 98,
					_: {
						dist: 'beta' as 'beta',
					},
				},
			],
			relievers: [
				{
					name: 'antipyretics',
					alpha: 1000,
					beta: 10,
					_: {
						dist: 'beta' as 'beta',
					},
				},
			],
			timeToOnset: {
				name: 'timeToOnset',
				location: 7,
				scale: 3,
				_: {
					dist: 'cauchy' as 'cauchy',
				},
			},
		},
	],
	signs: [],
};

const testPatient = createPatient(
	'female',
	18,
	[
		{
			name: 'fever',
			locations: [],
			duration: 1,
			onset: 'gradual',
			nature: [],
			periodicity: 'intermittent',
			aggravators: [],
			relievers: [],
		},
		{
			name: 'fever',
			locations: [],
			duration: 4,
			onset: 'sudden',
			nature: ['high-grade'],
			periodicity: 'intermittent',
			aggravators: [],
			relievers: ['paracetamol'],
		},
	],
	[]
);

describe('Patient Symptom Assessment', () => {
	const formattedPatient = formatPatient(testPatient);

	it('does not blow up in our face', () => {
		const result = interpret(testModel)(formattedPatient);

		console.log(result);
		expect(result).toBeDefined();
	});
});
