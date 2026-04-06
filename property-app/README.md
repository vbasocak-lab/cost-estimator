# Property Management System

This project is a Property Management System built with TypeScript and Express. It allows users to manage property listings, including creating, retrieving, updating, and deleting property information.

## Project Structure

```
property-app
├── src
│   ├── app.ts                # Entry point of the application
│   ├── models
│   │   └── property.ts       # Defines the structure of a property object
│   ├── controllers
│   │   └── propertyController.ts # Handles requests related to properties
│   ├── routes
│   │   └── propertyRoutes.ts  # Sets up routes for property-related operations
│   └── types
│       └── index.ts          # Defines types used in the application
├── package.json               # npm configuration file
├── tsconfig.json              # TypeScript configuration file
└── README.md                  # Project documentation
```

## Setup Instructions

1. Clone the repository:
   ```
   git clone <repository-url>
   ```

2. Navigate to the project directory:
   ```
   cd property-app
   ```

3. Install the dependencies:
   ```
   npm install
   ```

4. Run the application:
   ```
   npm start
   ```

## Usage

The application provides a RESTful API for managing properties. Below are the available endpoints:

- `POST /properties` - Create a new property
- `GET /properties/:id` - Retrieve a property by ID
- `PUT /properties/:id` - Update a property by ID
- `DELETE /properties/:id` - Delete a property by ID

## API Documentation

Refer to the API documentation for detailed information on request and response formats.