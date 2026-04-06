import express from 'express';
import { ProjectManager } from './projects/new/index';
import { PriceLibrary } from './price-library/index';
import { RulesEngine } from './rules/index';
import { Estimator } from './estimate/index';
import { Calculator } from './calculate/index';
import { LotManager } from './lot/index';
import { SummaryGenerator } from './summary/index';
import { PDFExporter } from './export-pdf/index';

const app = express();
const port = process.env.PORT || 3000;

// Initialize components
const projectManager = new ProjectManager();
const priceLibrary = new PriceLibrary();
const rulesEngine = new RulesEngine();
const estimator = new Estimator();
const calculator = new Calculator();
const lotManager = new LotManager();
const summaryGenerator = new SummaryGenerator();
const pdfExporter = new PDFExporter();

// Middleware and routes setup
app.use(express.json());

// Define routes here (example)
app.get('/projects', (req, res) => {
    // Logic to get projects
});

app.listen(port, () => {
    console.log(`Price Management application is running on http://localhost:${port}`);
});