import { combineBetas, createPatient, formatPatient, interpret } from '../src';
import { createBeta } from '../src/lib/distributions';
import { getBetaListMatch } from '../src/lib/getBetaListMatch';
import { randomSymptom } from '../src/utils';
// import { createBeta } from '../src/lib/distributions';

const symptoms: string[] = [
	'fever',
	'pruritis',
	'cough',
	'sore throat',
	'jaundice',
	'headache',
	'chills',
	'dyspnoea',
];

const malariaModel = {
	age: 10,
	sex: 'female',
	symptoms: symptoms.map(s => randomSymptom(s)),
};

const patient = createPatient(
	'male',
	10,
	[
		{
			name: 'fever',
			locations: [],
			duration: 12,
			onset: 'gradual',
			nature: ['high-grade'],
			periodicity: 'intermittent',
			aggravators: [],
			relievers: ['paracetamol'],
		},
		{
			name: 'pruritis',
			locations: ['face'],
			duration: 14,
			onset: 'gradual',
			nature: ['high-grade'],
			periodicity: 'intermittent',
			aggravators: [],
			relievers: ['paracetamol'],
		},
	],
	[]
);

const model = malariaModel;
// model.symptoms[0].locations.push()
const pt = patient;
// pt.symptoms[0].locations.push('headache');
pt.symptoms[0].nature = [];

describe('patient modelling stuff', () => {
	it('[SMOKE] works', () => {
		const result = interpret(false)(model)(formatPatient(pt));

		// console.log(result);
		expect(result).toBeDefined();
	});

	it('[SMOKE] getBetaListMatch works for empty arrays', () => {
		const emptyAndResult = getBetaListMatch(false)('and')([])([]);
		expect(emptyAndResult).toEqual(1);
	});

	it('[SMOKE] getBetaListMatch works for non empty arrays', () => {
		const result = getBetaListMatch(false)('and')([
			createBeta('a', 100, 1),
			createBeta('b', 100, 1),
		])([]);
		expect(result).toBeDefined();
	});

	it('[SMOKE] Does not explode when combining betas', () => {
		expect(
			combineBetas('combined', [
				createBeta('a', 100, 1),
				createBeta('b', 100, 1),
			])
		).toBeDefined();
	});
});
