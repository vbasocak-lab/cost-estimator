import express from 'express';
import { setBuildingRoutes } from './routes/buildingRoutes';
import { setEstimationRoutes } from './routes/estimationRoutes';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Routes
setBuildingRoutes(app);
setEstimationRoutes(app);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});