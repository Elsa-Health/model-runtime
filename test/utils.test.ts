import {
	convertAgeToGroup,
	friendlySymptomName,
	randomSymptom,
	toggleCondition,
} from '../src/utils';
import fc from 'fast-check';

describe('Utility functions are working fine', () => {
	it('Can get an age group given a numerical age', () => {
		fc.assert(
			fc.property(
				fc.float(),
				(age: number) => typeof convertAgeToGroup(age) === 'string'
			)
		);
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
});
