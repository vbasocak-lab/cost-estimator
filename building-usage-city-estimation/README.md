# Building Usage City Estimation

## Overview
This project is designed to manage building data, city information, and estimation modes. It provides a RESTful API for interacting with building and estimation resources.

## Project Structure
```
building-usage-city-estimation
├── src
│   ├── app.ts
│   ├── controllers
│   │   ├── buildingController.ts
│   │   └── estimationController.ts
│   ├── models
│   │   ├── building.ts
│   │   ├── city.ts
│   │   └── estimationMode.ts
│   ├── routes
│   │   ├── buildingRoutes.ts
│   │   └── estimationRoutes.ts
│   ├── services
│   │   ├── buildingService.ts
│   │   ├── cityService.ts
│   │   └── estimationService.ts
│   └── types
│       └── index.ts
├── package.json
├── tsconfig.json
└── README.md
```

## Installation
1. Clone the repository:
   ```
   git clone <repository-url>
   ```
2. Navigate to the project directory:
   ```
   cd building-usage-city-estimation
   ```
3. Install the dependencies:
   ```
   npm install
   ```

## Usage
To start the application, run:
```
npm start
```
The server will be running on `http://localhost:3000`.

## API Endpoints
### Building Endpoints
- `GET /buildings`: Retrieve a list of buildings.
- `POST /buildings`: Create a new building.
- `PUT /buildings/:id`: Update an existing building.

### Estimation Endpoints
- `GET /estimations`: Retrieve a list of estimations.
- `POST /estimations`: Create a new estimation.
- `PUT /estimations/:id`: Update an existing estimation.

## Contributing
Contributions are welcome! Please submit a pull request or open an issue for any enhancements or bug fixes.

## License
This project is licensed under the MIT License.