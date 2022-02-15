import {
	createPatient,
	formatPatient,
	interpret,
	interpretRandom,
} from '../src';
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
			name: 'fever',
			locations: [],
			sex: {
				male: {
					name: 'male',
					alpha: 100,
					beta: 1,
					_: {
						dist: 'beta',
					},
				},
				female: {
					name: 'female',
					alpha: 100,
					beta: 1,
					_: {
						dist: 'beta',
					},
				},
			},
			age: {
				newborn: {
					name: 'newborn',
					alpha: 90,
					beta: 10,
					_: {
						dist: 'beta',
					},
				},
				adolescent: {
					name: 'adolescent',
					alpha: 89,
					beta: 11,
					_: {
						dist: 'beta',
					},
				},
				infant: {
					name: 'infant',
					alpha: 80,
					beta: 20,
					_: {
						dist: 'beta',
					},
				},
				toddler: {
					name: 'toddler',
					alpha: 80,
					beta: 20,
					_: {
						dist: 'beta',
					},
				},
				child: {
					name: 'child',
					alpha: 81,
					beta: 19,
					_: {
						dist: 'beta',
					},
				},
				youngAdult: {
					name: 'youngAdult',
					alpha: 1,
					beta: 1,
					_: {
						dist: 'beta',
					},
				},
				adult: {
					name: 'adult',
					alpha: 1,
					beta: 1,
					_: {
						dist: 'beta',
					},
				},
				senior: {
					name: 'senior',
					alpha: 1,
					beta: 1,
					_: {
						dist: 'beta',
					},
				},
			},
			duration: {
				name: 'duration',
				mean: 1825,
				sd: 1,
				_: {
					dist: 'normal',
				},
				variance: 1,
			},
			onset: {
				name: 'onset',
				ps: [0.05, 0.95],
				ns: ['gradual', 'sudden'],
				_: {
					dist: 'categorical',
				},
			},
			nature: [
				{
					name: 'low-grade',
					alpha: 10,
					beta: 90,
					_: {
						dist: 'beta',
					},
				},
				{
					name: 'high-grade',
					alpha: 90,
					beta: 10,
					_: {
						dist: 'beta',
					},
				},
			],
			periodicity: {
				name: 'periodicity',
				ps: [0, 0, 0, 0, 0, 0.9, 0.1],
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
					dist: 'categorical',
				},
			},
			aggravators: [
				{
					name: 'pollen',
					alpha: 100,
					beta: 1,
					_: {
						dist: 'beta',
					},
				},
				{
					name: 'standing-up',
					alpha: 90,
					beta: 10,
					_: {
						dist: 'beta',
					},
				},
			],
			relievers: [],
			timeToOnset: {
				name: 'timeToOnset',
				location: 9,
				scale: 4,
				_: {
					dist: 'cauchy',
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
			onset: 'sudden',
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
		// @ts-ignore
		const result = interpret(false)(testModel)(formattedPatient);

		console.log(result);
		expect(result).toBeDefined();
	});

	it('does not blow up if we run a stochastic inference', () => {
		// @ts-ignore
		const results = interpretRandom(1000)(testModel)(formattedPatient);

		console.log(results);
		expect(results).toBeDefined();
	});
});
