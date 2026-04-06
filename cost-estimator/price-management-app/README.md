# Price Management App

## Overview
The Price Management App is designed to facilitate the management of a price library, define rules, estimate costs, calculate lots, summarize data, and export reports to PDF. This application provides a comprehensive solution for businesses to handle pricing and estimation efficiently.

## Features
- **Price Library Management**: Add, retrieve, and delete price items.
- **Rules Definition**: Create and manage rules that govern pricing and estimation.
- **Cost Estimation**: Generate cost estimates based on defined rules and price items.
- **Lot Calculation**: Calculate lots based on quantity and price.
- **Data Summarization**: Summarize data for reporting purposes.
- **PDF Export**: Export summaries and reports to PDF format.

## Project Structure
```
price-management-app
├── src
│   ├── app.ts
│   ├── controllers
│   ├── models
│   ├── services
│   ├── routes
│   ├── utils
│   └── types
├── templates
│   └── pdfTemplate.hbs
├── tests
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
   cd price-management-app
   ```
3. Install dependencies:
   ```
   npm install
   ```

## Usage
To start the application, run:
```
npm start
```
The application will be available at `http://localhost:3000`.

## Testing
To run the tests, use:
```
npm test
```

## Contributing
Contributions are welcome! Please submit a pull request or open an issue for any enhancements or bug fixes.

## License
This project is licensed under the MIT License.