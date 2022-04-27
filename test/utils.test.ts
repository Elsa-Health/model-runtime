import {
	convertAgeToGroup,
	friendlySymptomName,
	isWeibullList,
	mean,
	randomSymptom,
	symptomScore,
	toggleCondition,
} from '../src/utils';
import fc from 'fast-check';
import { createNormal, createWeibull } from '../src/lib/distributions';

describe('Utility functions are working fine', () => {
	it('Can get an age group given a numerical age', () => {
		fc.assert(
			fc.property(
				fc.float(),
				(age: number) => typeof convertAgeToGroup(age) === 'string'
			)
		);

		// @ts-ignore
		expect(convertAgeToGroup(undefined)).toEqual('n/a');
		expect(convertAgeToGroup(-1)).toEqual('n/a');
	});

	it('Can generate a random symptom given only a name', () => {
		fc.assert(
			fc.property(fc.string(), (name: string) => {
				const symptom = randomSymptom(name);
				return symptom.name === name;
			})
		);
	});

	it('friendly formats symptom names', () => {
		expect(friendlySymptomName('low-grade')).toBe('Low grade');
		expect(friendlySymptomName('fever')).toBe('Fever');
	});

	it('Can toggle a condition value inside a conditions list', () => {
		const a = [{ name: 'here' }, { name: 'there' }, { name: 'everywhere' }];
		const b = toggleCondition(a, { name: 'here' });
		const c = toggleCondition(b, { name: 'here' });

		// When you remove an item the length reduces
		expect(b).toHaveLength(a.length - 1);

		// When you return that item the length goes back to original
		expect(c).toHaveLength(a.length);

		// The array with the items returned should countain the same items as the original
		expect(a.sort((a, b) => (a.name > b.name ? -1 : 1))).toEqual(
			c.sort((a, b) => (a.name > b.name ? -1 : 1))
		);
	});

	it('Checks if a list is of weibull variables', () => {
		const wList = [createWeibull('a', 10, 1, 1)];
		const nList = [createNormal('b', 4, 2)];

		expect(isWeibullList(wList)).toBe(true);
		expect(isWeibullList(nList)).toBe(false);
	});

	it('Calculates the mean without breaking', () => {
		fc.assert(
			fc.property(
				fc.float64Array(),
				list => typeof mean((list as unknown) as number[]) === 'number'
			)
		);
	});

	it('Can score a symptom based on the LDONPAR features of the symptom', () => {
		const def = {
			sexMatch: 1,
			ageMatch: 1,
			locationMatch: 1,
			durationMatch: 1,
			onsetMatch: 1,
			natureMatch: 1,
			periodicityMatch: 1,
			aggravatorsMatch: 1,
			relieversMatch: 1,
			timeToOnsetMatch: 1,
		};
		const score1 = symptomScore({ ...def });
		const score2 = symptomScore({
			...def,
			natureMatch: 0.3,
			periodicityMatch: 0.4,
		});
		const score3 = symptomScore({
			...def,
			natureMatch: 0.4,
			periodicityMatch: 0.3,
		});
		// const score4 = symptomScore({ ...def, periodicityMatch: 0.9 });
		// const score4 = symptomScore({ ...def, natureMatch: 0.9 });

		expect(score1).toBeGreaterThan(score2);
		expect(score3).toBeGreaterThan(score2);

		expect(symptomScore({ ...def, periodicityMatch: 0.5 })).toEqual(
			symptomScore({ ...def, onsetMatch: 0.5 })
		);
	});
});
