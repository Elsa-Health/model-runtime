import fc from 'fast-check';
import {
	createCauchy,
	createNormal,
	createWeibull,
} from '../../src/lib/distributions';

describe('Creation of Random Variables works', () => {
	it('Creates a normal variable', () => {
		fc.assert(
			fc.property(
				fc.float(),
				fc.float({ next: false, min: 0.01 }),
				(a, b) => {
					const rv = createNormal('testNormal', a, b);
					return (
						rv._.dist === 'normal' && rv.mean === a && rv.sd === b
					);
				}
			)
		);
	});

	it('Creates a weibull variable', () => {
		fc.assert(
			fc.property(
				fc.float({ next: false, min: 0.01 }),
				fc.float({ next: false, min: 0.01 }),
				fc.float({ next: false, min: 0.01 }),
				(a, b, c) => {
					const rv = createWeibull('testWeibull', a, b, c);
					return (
						rv._.dist === 'weibull' &&
						rv.threshold === a &&
						rv.shape === b &&
						rv.scale === c
					);
				}
			)
		);
	});

	it('Creates a cauchy variable', () => {
		fc.assert(
			fc.property(
				fc.float(),
				fc.float({ next: false, min: 0.01 }),
				(a, b) => {
					const rv = createCauchy('testCauchy', a, b);

					return (
						rv._.dist === 'cauchy' &&
						rv.scale === b &&
						rv.location === a
					);
				}
			)
		);
	});
});
