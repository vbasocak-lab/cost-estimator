# Code Mapping Pipeline

## Overview
The Code Mapping Pipeline is a TypeScript-based application designed to process project inputs and generate a final list of active codes through a series of defined stages. This pipeline reads inputs, builds default codes, applies mapping rules, performs operations on the codes, and determines the source for quantity data.

## Project Structure
```
code-mapping-pipeline
├── src
│   ├── app.ts                  # Entry point of the application
│   ├── pipeline
│   │   ├── index.ts            # Main pipeline function
│   │   ├── readInputs.ts       # Reads project inputs
│   │   ├── buildDefaultCodes.ts # Creates default active codes
│   │   ├── applyMappingRules.ts # Applies mapping rules to active codes
│   │   ├── applyOperations.ts   # Performs operations on active codes
│   │   ├── determineQuantitySource.ts # Identifies quantity data source
│   │   └── buildFinalCodes.ts   # Compiles final list of active codes
│   ├── models
│   │   ├── MappingRule.ts       # Defines mapping rule structure
│   │   ├── ActiveCode.ts        # Represents an active code
│   │   └── ProjectInput.ts      # Defines project input structure
│   ├── utils
│   │   └── index.ts             # Utility functions
│   └── types
│       └── index.ts             # TypeScript types and interfaces
├── tests
│   ├── buildDefaultCodes.test.ts # Unit tests for buildDefaultCodes
│   ├── applyMappingRules.test.ts # Unit tests for applyMappingRules
│   └── buildFinalCodes.test.ts   # Unit tests for buildFinalCodes
├── package.json                  # npm configuration file
├── tsconfig.json                 # TypeScript configuration file
└── README.md                     # Project documentation
```

## Setup
1. Clone the repository:
   ```
   git clone <repository-url>
   ```
2. Navigate to the project directory:
   ```
   cd code-mapping-pipeline
   ```
3. Install dependencies:
   ```
   npm install
   ```

## Usage
To run the application, execute the following command:
```
npm start
```

This will initialize the pipeline and process the project inputs according to the defined stages.

## Contributing
Contributions are welcome! Please submit a pull request or open an issue for any enhancements or bug fixes.

## License
This project is licensed under the MIT License. See the LICENSE file for details.