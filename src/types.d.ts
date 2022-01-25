type Sex = 'male' | 'female';

type Beta = {
	name: string;
	alpha: number;
	beta: number;
	_: {
		dist: 'beta';
	};
};

type Normal = {
	name: string;
	mean: number;
	sd: number;
	_: {
		dist: 'normal';
	};
};

type Weibull = {
	name: string;
	threshold: number;
	shape: number;
	scale: number;
	_: {
		dist: 'weibull';
	};
};

type Change<T> = {
	name: string;
	from: T;
	to: T;
	duration: number;
	category: 'color' | 'shape' | 'size' | string;
	_: {
		dist: 'change';
	};
};

type Categorical = {
	name: string;
	ps: number[];
	ns: string[];
	_: { dist: 'categorical' };
};

type Onset = 'gradual' | 'sudden';

type Cauchy = {
	name: string;
	location: number;
	scale: number;
	_: {
		dist: 'cauchy';
	};
};

type BetaCombinationRule = 'or' | 'and';

type Symptom = {
	name: string;
	locations: Beta[];
	//   duration: Weibull;
	duration: Normal;
	onset: Categorical;
	nature: (Beta | Weibull | Change)[];
	periodicity: Categorical;
	aggravators: Beta[];
	relievers: Beta[];
	timeToOnset: Cauchy;
};

type ConditionModel = {
	symptoms: Symptom[];
};

type Condition = {
	name: string;
};

type PatientSymptom = {
	name: string;
	locations: string[];
	duration: number;
	onset: Onset;
	nature: string[];
	periodicity: string;
	aggravators: string[];
	relievers: string[];
};

type FormattedPatientSymptom = PatientSymptom & {
	timeToOnset: number;
};

type Signs = any;

type Patient = {
	age: number;
	sex: Sex;
	symptoms: PatientSymptom[];
	signs: Sign[];
};

type FormattedPatient = {
	age: number;
	sex: Sex;
	symptoms: FormattedPatientSymptom[];
	signs: Sign[];
};
