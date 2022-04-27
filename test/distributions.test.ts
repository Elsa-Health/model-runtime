import {
	createBeta,
	createCategorical,
	createCauchy,
	createChange,
	createNormal,
	createWeibull,
} from '../src/lib/distributions';
import { getBetaListMatch } from '../src/lib/getBetaListMatch';

describe('Beta distributions', () => {
	const simpleBetas = [
		createBeta('one', 100, 1),
		createBeta('two', 100, 1),
		createBeta('three', 100, 1),
	];

	const simpleMatcher = getBetaListMatch(false)('or')(simpleBetas);

	it('Can Create a list of betas', () => {
		const combinationsList = ['one', 'two'];
		const rv = createBeta(combinationsList, 100, 1, {
			dist: 'beta',
			combination: true,
		});

		expect(rv).toBeDefined();
	});

	it('Can create a single beta variable', () => {
		const rv = createBeta('test-name', 100, 1);

		expect(rv).toBeDefined();
		expect(() => createBeta('broken', 0, -10)).toThrow(Error);
	});

	it('Properly calculates a probability of a set of probabilities', () => {
		const simpleSum = simpleMatcher(['one', 'two']);
		expect(simpleSum).toBeDefined();

		const simpleBetas2 = [
			createBeta(['one', 'two'], 100, 1, {
				combination: true,
				dist: 'beta',
			}),
			createBeta('three', 100, 1),
		];
		const simpleSum2 = getBetaListMatch(false)('or')(simpleBetas2)([
			'one',
			'three',
		]);
		expect(simpleSum2).toBeLessThan(simpleSum);
	});

	it('Matches lists with different likelihoods depending on the match', () => {
		const perm1 = simpleMatcher(['one']);
		const perm2 = simpleMatcher(['one', 'two']);
		const perm3 = simpleMatcher(['one', 'two', 'three']);

		// console.log({ perm1, perm2 });
		expect(perm1).toBeLessThan(perm2);
		expect(perm2).toBeLessThan(perm3);
	});

	it('Can penalize a list for having unexpected entries', () => {
		const perm1 = simpleMatcher(['one', 'two'], 0.5);
		const perm2 = simpleMatcher(['one', 'two', 'a', 'c'], 0.5);

		expect(perm1).toBeGreaterThan(perm2);
	});

	it('Can define a proper normal distribution', () => {
		expect(createNormal('test', 2, 5)).toBeDefined();
		expect(() => createNormal('test', 2, -10)).toThrow(Error);
	});

	it('Can define a proper weibull distribution', () => {
		expect(createWeibull('test', 1, 2, 5)).toBeDefined();
		expect(() => createWeibull('test', 1, 0, -1)).toThrow(Error);
	});

	it('Can define a proper categorical distribution', () => {
		expect(createCategorical('name', ['a'], [2])).toBeDefined();
		expect(() => createCategorical('test', ['a', 'b'], [0.5])).toThrow(
			Error
		);
		expect(() =>
			createCategorical('test', ['a', 'b'], [0.5, 0.6, 0.9])
		).toThrow(Error);
	});

	it('Can define a proper cauchy distribution', () => {
		expect(createCauchy('test', 2, 5)).toBeDefined();
		expect(() => createCauchy('test', 2, -10)).toThrow(Error);
		expect(() => createCauchy('test', 2, 0)).toThrow(Error);
	});

	it('Can define a proper change distribution', () => {
		expect(createChange('test', 2, 5, 4, 'color')).toBeDefined();
		expect(() => createChange('test', 2, 5, -1, 'color')).toThrow(Error);
	});
});
