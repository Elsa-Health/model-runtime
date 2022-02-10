export type Sex = 'male' | 'female';

export type Beta = {
	name: string;
	alpha: number;
	beta: number;
	_: {
		dist: 'beta';
	};
};

export type Normal = {
	name: string;
	mean: number;
	sd: number;
	_: {
		dist: 'normal';
	};
};

export type Weibull = {
	name: string;
	threshold: number;
	shape: number;
	scale: number;
	_: {
		dist: 'weibull';
	};
};

export type Change<T> = {
	name: string;
	from: T;
	to: T;
	duration: number;
	category: 'color' | 'shape' | 'size' | string;
	_: {
		dist: 'change';
	};
};

export type Categorical = {
	name: string;
	ps: number[];
	ns: string[];
	_: { dist: 'categorical' };
};

export type Onset = 'gradual' | 'sudden';

export type Cauchy = {
	name: string;
	location: number;
	scale: number;
	_: {
		dist: 'cauchy';
	};
};

export type BetaCombinationRule = 'or' | 'and';

export type Symptom = {
	name: string;
	locations: Beta[];
	sex: {
		male: Beta;
		female: Beta;
	};
	age: {
		newborn: Beta;
		infant: Beta;
		toddler: Beta;
		preAdolescent: Beta;
		adolescent: Beta;
		youngAdult: Beta;
		youngMiddleAgeAdult: Beta;
		oldMiddleAgeAdult: Beta;
		elderly: Beta;
	};
	//   duration: Weibull;
	duration: Normal;
	onset: Categorical;
	nature: (Beta | Weibull | Change<any>)[];
	periodicity: Categorical;
	aggravators: Beta[];
	relievers: Beta[];
	timeToOnset: Cauchy;
};

export type ConditionModel = {
	symptoms: Symptom[];
};

export type Condition = {
	name: string;
};

export type PatientSymptom = {
	name: string;
	locations: string[];
	duration: number;
	onset: Onset;
	nature: string[];
	periodicity: string;
	aggravators: string[];
	relievers: string[];
};

export type FormattedPatientSymptom = PatientSymptom & {
	timeToOnset: number;
};

export type Sign = any;

export type Patient = {
	age: number;
	sex: Sex;
	symptoms: PatientSymptom[];
	signs: Sign[];
};

export type FormattedPatient = {
	age: number;
	sex: Sex;
	symptoms: FormattedPatientSymptom[];
	signs: Sign[];
};
