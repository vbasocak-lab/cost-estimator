# Window and Door Configuration Project

This project is designed to manage and configure window and door specifications for various applications. It provides a structured way to handle requests related to windows and doors, including their properties and business logic.

## Project Structure

- **src/**: Contains the main application code.
  - **app.ts**: Entry point of the application, initializes the Express app and sets up middleware and routes.
  - **controllers/**: Contains controllers for handling requests.
    - **windowController.ts**: Manages window-related requests.
    - **doorController.ts**: Manages door-related requests.
  - **models/**: Defines the data models.
    - **window.ts**: Defines the Window model with properties like windowAreaRatio, windowGlazingType, windowFrameType, and windowOpeningType.
    - **door.ts**: Defines the Door model with properties like doorWindowType, interiorDoorCount, and interiorDoorType.
  - **routes/**: Sets up the application routes.
    - **windowRoutes.ts**: Configures routes for window operations.
    - **doorRoutes.ts**: Configures routes for door operations.
  - **services/**: Contains business logic.
    - **windowService.ts**: Manages window-related business logic.
    - **doorService.ts**: Manages door-related business logic.
  - **types/**: Defines TypeScript types and interfaces.
    - **window.types.ts**: Types related to windows.
    - **door.types.ts**: Types related to doors.

- **tests/**: Contains unit tests for the application.
  - **window.test.ts**: Tests for window functionality.
  - **door.test.ts**: Tests for door functionality.

- **tsconfig.json**: TypeScript configuration file.

- **package.json**: npm configuration file.

## Setup Instructions

1. Clone the repository:
   ```
   git clone <repository-url>
   ```

2. Navigate to the project directory:
   ```
   cd window-door-config
   ```

3. Install the dependencies:
   ```
   npm install
   ```

4. Run the application:
   ```
   npm start
   ```

## Usage Guidelines

- Use the defined routes to interact with window and door data.
- Follow the structure of the models to ensure data integrity.
- Implement additional features as needed by extending the services and controllers.

## Contributing

Contributions are welcome! Please submit a pull request or open an issue for any enhancements or bug fixes.