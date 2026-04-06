import express from 'express';
import bodyParser from 'body-parser';
import priceLibraryRoutes from './routes/priceLibraryRoutes';
import rulesRoutes from './routes/rulesRoutes';
import estimationRoutes from './routes/estimationRoutes';
import lotsRoutes from './routes/lotsRoutes';
import summaryRoutes from './routes/summaryRoutes';
import exportRoutes from './routes/exportRoutes';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use('/api/price-library', priceLibraryRoutes);
app.use('/api/rules', rulesRoutes);
app.use('/api/estimation', estimationRoutes);
app.use('/api/lots', lotsRoutes);
app.use('/api/summary', summaryRoutes);
app.use('/api/export', exportRoutes);

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});