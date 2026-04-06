# Code Resolver Project

## Overview
The Code Resolver Project is designed to manage and resolve codes within a given project context. It provides a set of functions to handle default codes, apply mappings, calculate quantities, and build lot lines based on active codes.

## File Structure
```
code-resolver-project
├── src
│   ├── index.ts
│   ├── resolveDefaultCodes.ts
│   ├── applyMappings.ts
│   ├── resolveQuantity.ts
│   ├── buildLotLines.ts
│   ├── types
│   │   └── index.ts
│   └── utils
│       └── index.ts
├── tests
│   ├── resolveDefaultCodes.test.ts
│   ├── applyMappings.test.ts
│   ├── resolveQuantity.test.ts
│   └── buildLotLines.test.ts
├── package.json
├── tsconfig.json
└── README.md
```

## Installation
To install the necessary dependencies, run the following command in the project root directory:

```
npm install
```

## Usage
To use the functionalities provided by the Code Resolver Project, you can import the relevant functions from the `src` directory. For example:

```typescript
import { resolveDefaultCodes } from './src/resolveDefaultCodes';
import { applyMappings } from './src/applyMappings';
```

## Running Tests
To ensure the correctness of the implemented functions, unit tests are provided. You can run the tests using:

```
npm test
```

## Contributing
Contributions are welcome! Please feel free to submit a pull request or open an issue for any enhancements or bug fixes.

## License
This project is licensed under the MIT License. See the LICENSE file for more details.