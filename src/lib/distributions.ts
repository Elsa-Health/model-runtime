import * as T from '../public-types';

export function createBeta(name: string, alpha: number, beta: number): T.Beta {
	if (alpha <= 0 || beta <= 0) {
		throw new Error(
			`Invalid beta distribution parameters: ${alpha}/${beta}`
		);
	}
	return {
		name,
		alpha,
		beta,
		_: { dist: 'beta' },
	};
}

export function createNormal(name: string, mean: number, sd: number): T.Normal {
	if (sd <= 0) {
		throw new Error(`Invalid normal distribution variance: ${sd}`);
	}
	return {
		name,
		mean,
		sd,
		_: { dist: 'normal' },
	};
}

export function createWeibull(
	name: string,
	threshold: number,
	shape: number,
	scale: number
): T.Weibull {
	if (shape <= 0 || scale <= 0) {
		throw new Error(
			`Invalid weibull distribution parameters: ${shape}/${scale}`
		);
	}
	return {
		name,
		threshold,
		shape,
		scale,
		_: { dist: 'weibull' },
	};
}

export function createChange<T>(
	name: string,
	from: T,
	to: T,
	duration: number,
	category: 'color' | 'shape' | 'size' | string
): T.Change<T> {
	if (duration <= 0) {
		throw new Error(`Invalid change distribution duration: ${duration}`);
	}
	return {
		name,
		from,
		to,
		duration,
		category,
		_: { dist: 'change' },
	};
}

export function createCategorical(
	name: string,
	ns: string[],
	ps: number[]
): T.Categorical {
	if (ps.length !== ns.length) {
		throw new Error(
			`Invalid categorical distribution parameters: ${ps}/${ns}`
		);
	}
	return {
		name,
		ps,
		ns,
		_: { dist: 'categorical' },
	};
}

export function createOnset(onset: T.Onset): T.Onset {
	return onset;
}

/*
 * Create a caucy random variable
 * param {name}: number
 * param {location}: number
 * param {scale}: number
 */
export function createCauchy(
	name: string,
	location: number,
	scale: number
): T.Cauchy {
	if (scale <= 0) {
		throw new Error(`Invalid cauchy distribution scale: ${scale}`);
	}
	return {
		name,
		location,
		scale,
		_: { dist: 'cauchy' },
	};
}
