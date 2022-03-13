export type Sex = 'male' | 'female';

export type BetaOptions = {
	dist: 'beta';
	combination: boolean;
};

export type Beta =
	| {
			name: string;
			alpha: number;
			beta: number;
			_: BetaOptions & { combination: false };
	  }
	| {
			name: string[];
			alpha: number;
			beta: number;
			_: BetaOptions & { combination: true };
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

// Newborn: 0 weeks - 2 months
// Infants: 2 months - 12 months
// Toddler: 12 months - 4 years
// Child: 4 years - 12 years
// Adolescent: 12-18 years
// Young Adult: 18-34 years
// Adult: 35- 64 years
// Senior: 65 years +
export type AgeGroup =
	| 'newborn'
	| 'infant'
	| 'toddler'
	| 'child'
	| 'adolescent'
	| 'youngAdult'
	| 'adult'
	| 'senior';

export type Symptom = {
	name: string;
	locations: Beta[];
	sex: {
		male: Beta;
		female: Beta;
	};
	age: Record<AgeGroup, Beta>;
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
