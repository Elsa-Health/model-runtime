<svg xmlns="http://www.w3.org/2000/svg" style="height: 100px; width: 100px" fill="none" viewBox="0 0 24 24" stroke="currentColor">
  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.871 4A17.926 17.926 0 003 12c0 2.874.673 5.59 1.871 8m14.13 0a17.926 17.926 0 001.87-8c0-2.874-.673-5.59-1.87-8M9 9h1.246a1 1 0 01.961.725l1.586 5.55a1 1 0 00.961.725H15m1-7h-.08a2 2 0 00-1.519.698L9.6 15.302A2 2 0 018.08 16H8" />
</svg>

# Elsa Model Interpreter (WIP)

A simple library to evaulate Elsa Open Health Models for use in any environment.

## Badges

[![Apache-2.0 License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](https://www.apache.org/licenses/LICENSE-2.0)

[![Model Interpreter](https://img.shields.io/badge/model%20interpreter-0.0.1-yellow)](https://img.shields.io/badge/model--interpreter--0.0.3-yellow)

[![Coverage Status](https://coveralls.io/repos/github/Elsa-Health/model-runtime/badge.svg?branch=main)](https://coveralls.io/github/Elsa-Health/model-runtime?branch=main)

## Installation

```
yarn add @elsa-health/model-runtime
```

## Usage/Examples

```js
import {
	createPatient,
	interpret,
	formatPatient,
} from '@elsa-health/model-runtime';

const symptoms = [
	{
		name: 'fever',
		locations: [],
		duration: 3,
		onset: 'sudden',
		nature: 'high-grade',
		periodicity: 'intermittent',
		aggravators: ['bright-lights', 'crying'],
		relievers: ['paracetamol'],
	},
];

const signs = [];

// Define your patient
const patient = createPatient('male', 22, symptoms, signs);

// Run the assessment
const isStochastic = false; // set to true if you want to allow randomness in the results - good for error margins
const result = interpret(isStochastic)(diseaseModel)(
	formatPatient(formatPatient)
);

console.log('Here is the result: ', result);
```

## Deployment

// TODO

## Roadmap

-   [x] 80% Test coverage
-   [ ] Support for more random variables in symptom natures
    -   [ ] Support Weibul Variables
    -   [ ] Support Changing Variables - size, color, elevatedness, etc
-   [x] Optional Support for uncertainity in the results through sampling of the random variables.
-   [ ] Support patient assessment results that show exactly what symptom features are not matching or are matching with different degees. (path towards explainability??)
-   [ ] Support weights for each of the symptom features
-   [x] Support for age differences in model definitions
-   [x] Support for sex differences in model definitions

## FAQ

// TODO

## License

[Apache 2.0](https://choosealicense.com/licenses/apache-2.0/)
