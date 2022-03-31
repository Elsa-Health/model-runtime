import { getBetaP } from '../../src/lib/getBetaListMatch';

describe('Beta functions work as expected', () => {
	it('returns a valid p of a beta rv', () => {
		const a = getBetaP(100, 10, true);
		const b = getBetaP(100, 10, false);

		expect(a).toBeGreaterThan(b);
	});
});
