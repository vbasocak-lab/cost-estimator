# Estimation Pipeline

This project is designed to facilitate the estimation process through a structured pipeline. It consists of multiple steps that collect inputs, apply various calculations, and generate a detailed breakdown of the estimation.

## Project Structure

- **src/**: Contains the source code for the estimation pipeline.
  - **app.ts**: Entry point of the application.
  - **pipeline/**: Contains the main pipeline logic and steps.
    - **index.ts**: Exports the main pipeline function.
    - **steps/**: Individual steps of the estimation process.
      - **01-collect-inputs.ts**: Collects project inputs.
      - **02-generate-defaults.ts**: Generates default values.
      - **03-load-base-lots.ts**: Loads base required lots.
      - **04-apply-mapping-rules.ts**: Applies mapping rules to inputs.
      - **05-build-active-article-list.ts**: Generates a list of active articles.
      - **06-run-quantity-resolver.ts**: Resolves quantities.
      - **07-apply-indexed-price.ts**: Applies indexed pricing.
      - **08-apply-regional-coef.ts**: Applies regional coefficients.
      - **09-apply-finish-coef.ts**: Applies finish coefficients.
      - **10-apply-contingency.ts**: Applies contingency factors.
      - **11-apply-overhead.ts**: Applies overhead costs.
      - **12-apply-profit.ts**: Calculates and applies profit margins.
      - **13-apply-vat.ts**: Applies VAT to the estimation.
      - **14-evaluate-confidence.ts**: Evaluates confidence level.
      - **15-generate-breakdown.ts**: Generates a detailed breakdown.
    - **runner.ts**: Manages the execution flow of the pipeline.
  - **resolvers/**: Contains logic for resolving quantities and prices.
    - **quantity-resolver.ts**: Handles quantity resolution.
    - **price-resolver.ts**: Handles price resolution.
  - **coefficients/**: Defines coefficients used in pricing calculations.
    - **regional.ts**: Regional coefficients.
    - **finish.ts**: Finish coefficients.
  - **models/**: Contains data models for the estimation process.
    - **input.ts**: Structure of project inputs.
    - **lot.ts**: Structure of lots.
    - **article.ts**: Structure of articles.
    - **breakdown.ts**: Structure of breakdowns.
    - **estimation.ts**: Structure of overall estimations.
  - **data/**: Contains data files used in the estimation process.
    - **base-lots.json**: Base lots data.
    - **mapping-rules.json**: Mapping rules for inputs.
  - **types/**: Exports various types and interfaces.
    - **index.ts**: Type definitions.
  - **utils/**: Utility functions for logging and calculations.
    - **logger.ts**: Logging utilities.
    - **math.ts**: Mathematical utilities.

## Installation

To install the necessary dependencies, run:

```
npm install
```

## Usage

To run the estimation pipeline, execute:

```
npm start
```

## Testing

To run the tests, use:

```
npm test
```

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.

## License

This project is licensed under the MIT License.