import { createBeta } from '../src/lib/distributions';
import { getBetaListMatch } from '../src/lib/getBetaListMatch';

describe('Beta distributions', () => {
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
	});

	it('Properly calculates a probability of a set of probabilities', () => {
		const simpleBetas = [
			createBeta('one', 100, 1),
			createBeta('two', 100, 1),
		];
		const simpleSum = getBetaListMatch(false)('or')(simpleBetas)([
			'one',
			'two',
		]);
		console.log({ simpleSum });
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
		console.log({ simpleSum2 });
		expect(simpleSum2).toBeLessThan(simpleSum);
	});
});
