# Construction Estimation Application

This project is a construction estimation application designed to help users estimate the costs associated with various construction projects. It provides a structured way to input project details and calculate total costs based on different components.

## Project Structure

```
construction-estimation-app
├── src
│   ├── app.ts                # Entry point of the application
│   ├── components            # Contains various components for estimation
│   │   ├── SurfaceM2.ts     # Class for surface area calculations
│   │   ├── ProjectType.ts    # Enum for project types
│   │   ├── FinishLevel.ts    # Enum for finish levels
│   │   ├── Region.ts         # Class for region-specific cost factors
│   │   ├── Heating.ts        # Class for heating cost calculations
│   │   ├── Structure.ts      # Class for structure-related costs
│   │   └── Roof.ts           # Class for roofing costs
│   ├── controllers           # Contains controllers for handling requests
│   │   └── EstimationController.ts # Controller for estimation logic
│   ├── models                # Contains data models
│   │   ├── Estimation.ts     # Model for estimation data
│   │   └── Project.ts        # Model for project data
│   ├── routes                # Contains route definitions
│   │   └── index.ts          # API route definitions
│   ├── services              # Contains business logic services
│   │   └── EstimationService.ts # Service for estimation calculations
│   └── types                 # Contains TypeScript types and interfaces
│       └── index.ts          # Type definitions for estimation and project data
├── package.json              # npm configuration file
├── tsconfig.json             # TypeScript configuration file
└── README.md                 # Project documentation
```

## Setup Instructions

1. **Clone the repository:**
   ```
   git clone <repository-url>
   cd construction-estimation-app
   ```

2. **Install dependencies:**
   ```
   npm install
   ```

3. **Run the application:**
   ```
   npm start
   ```

## Usage

- The application provides an API for creating and retrieving estimations. 
- You can define project details such as surface area, project type, finish level, region, heating type, structure, and roof specifications.
- The application will calculate the total cost based on the provided inputs.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or features you would like to add.