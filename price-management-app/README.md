# Price Management Application

This is a Price Management application designed to manage pricing data, evaluate pricing rules, calculate estimates, and generate summaries. The application is structured into various components, each responsible for specific functionalities.

## Project Structure

```
price-management-app
├── src
│   ├── app.ts                  # Entry point of the application
│   ├── projects
│   │   └── new
│   │       └── index.ts       # Logic for managing new projects
│   ├── price-library
│   │   ├── index.ts           # Manages price data
│   │   └── types
│   │       └── index.ts       # Defines price-related data structures
│   ├── rules
│   │   ├── index.ts           # Evaluates pricing rules
│   │   └── types
│   │       └── index.ts       # Defines rule structures
│   ├── estimate
│   │   ├── index.ts           # Calculates estimates based on pricing data
│   │   └── types
│   │       └── index.ts       # Defines estimate structures
│   ├── calculate
│   │   ├── index.ts           # Performs calculations related to pricing
│   │   └── types
│   │       └── index.ts       # Defines calculation structures
│   ├── lot
│   │   ├── index.ts           # Manages lots of products
│   │   └── types
│   │       └── index.ts       # Defines lot structures
│   ├── summary
│   │   ├── index.ts           # Creates summaries of pricing data
│   │   └── types
│   │       └── index.ts       # Defines summary structures
│   ├── export-pdf
│   │   ├── index.ts           # Handles exporting data to PDF format
│   │   └── types
│   │       └── index.ts       # Defines PDF-related data structures
│   └── types
│       └── index.ts           # Common types and interfaces
├── package.json                # npm configuration file
├── tsconfig.json               # TypeScript configuration file
└── README.md                   # Project documentation
```

## Setup Instructions

1. Clone the repository:
   ```
   git clone <repository-url>
   ```

2. Navigate to the project directory:
   ```
   cd price-management-app
   ```

3. Install the dependencies:
   ```
   npm install
   ```

4. Compile the TypeScript files:
   ```
   npm run build
   ```

5. Run the application:
   ```
   npm start
   ```

## Usage Guidelines

- Use the `ProjectManager` class in `src/projects/new/index.ts` to create and manage new projects.
- The `PriceLibrary` class in `src/price-library/index.ts` allows you to manage price data.
- Utilize the `RulesEngine` in `src/rules/index.ts` to evaluate pricing rules.
- The `Estimator` class in `src/estimate/index.ts` helps in calculating estimates.
- Perform calculations using the `Calculator` class in `src/calculate/index.ts`.
- Manage product lots with the `LotManager` class in `src/lot/index.ts`.
- Generate summaries using the `SummaryGenerator` class in `src/summary/index.ts`.
- Export data to PDF format with the `PDFExporter` class in `src/export-pdf/index.ts`.

For more detailed information on each component, refer to the respective files in the `src` directory.