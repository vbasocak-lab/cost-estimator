# Price Code Mappings

This project provides an API for managing price code mappings. It allows users to retrieve and create mappings between price codes and their corresponding prices.

## Project Structure

- **src/**: Contains the source code for the application.
  - **app.ts**: Entry point of the application. Initializes the Express app and sets up middleware and routes.
  - **controllers/**: Contains the controller for handling requests related to price code mappings.
    - **priceMappingController.ts**: Exports the `PriceMappingController` class with methods for retrieving and creating price mappings.
  - **models/**: Defines the structure of the data used in the application.
    - **priceCodeMapping.ts**: Exports the `PriceCodeMapping` class, which includes properties and methods for data validation.
  - **routes/**: Sets up the API routes for the application.
    - **priceMappingRoutes.ts**: Exports the `setRoutes` function that configures the routes using the controller.
  - **services/**: Contains business logic for managing price code mappings.
    - **priceMappingService.ts**: Exports the `PriceMappingService` class with methods for interacting with the data layer.
  - **types/**: Defines the types used throughout the application.
    - **index.ts**: Exports interfaces such as `PriceCodeMapping` and `PriceMappingRequest`.

## Setup Instructions

1. Clone the repository:
   ```
   git clone <repository-url>
   ```

2. Navigate to the project directory:
   ```
   cd price-code-mappings
   ```

3. Install the dependencies:
   ```
   npm install
   ```

4. Start the application:
   ```
   npm start
   ```

## Usage

Once the application is running, you can interact with the API endpoints to manage price code mappings. Refer to the API documentation for detailed usage instructions.

## License

This project is licensed under the MIT License.