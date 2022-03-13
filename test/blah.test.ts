import { createPatient, formatPatient, interpret } from '../src';
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
	it('works', () => {
		const result = interpret(false)(model)(formatPatient(pt));

		console.log(result);
		expect(result).toBeDefined();
	});

	it('getBetaListMatch works for empty arrays', () => {
		// console.log(
		// 	getBetaListMatch('or')([
		// 		createBeta('one', 110, 10),
		// 		createBeta('two', 10, 100),
		// 	])([])
		// );
		const emptyAndResult = getBetaListMatch(false)('and')([])([]);
		expect(emptyAndResult).toEqual(1);
	});
});
