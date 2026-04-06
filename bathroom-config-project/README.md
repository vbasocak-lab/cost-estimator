# Bathroom Configuration Project

This project is designed to manage and configure bathroom and kitchen settings. It provides a structured way to define various properties related to bathrooms and kitchens, ensuring type safety and ease of use.

## Project Structure

- **src/app.ts**: Entry point of the application. Initializes the application and sets up necessary configurations and routes.
- **src/models/index.ts**: Exports classes or interfaces related to bathroom and kitchen configurations, including properties such as:
  - `bathroom_level`
  - `bathroom_type`
  - `wc_type`
  - `shower_type`
  - `vanity_type`
  - `bathtub_type`
  - `kitchen_type`
  - `kitchen_credence_type`
  - `has_buanderie`
  - `has_cellier`
  - `cellier_storage_level`
  
- **src/types/index.ts**: Exports TypeScript types or interfaces that define the structure of the data used in the application.

- **src/utils/index.ts**: Contains utility functions for processing or validating configuration data.

- **tsconfig.json**: TypeScript configuration file specifying compiler options.

- **package.json**: npm configuration file listing dependencies, scripts, and project metadata.

## Setup Instructions

1. Clone the repository:
   ```
   git clone <repository-url>
   ```

2. Navigate to the project directory:
   ```
   cd bathroom-config-project
   ```

3. Install dependencies:
   ```
   npm install
   ```

4. Run the application:
   ```
   npm start
   ```

## Usage

This project allows users to define and manage configurations for bathrooms and kitchens. You can extend the models and types as needed to accommodate additional features or properties.

## Contributing

Contributions are welcome! Please submit a pull request or open an issue for any enhancements or bug fixes.