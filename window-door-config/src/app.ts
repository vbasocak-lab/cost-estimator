import express from 'express';
import { setWindowRoutes } from './routes/windowRoutes';
import { setDoorRoutes } from './routes/doorRoutes';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Routes
setWindowRoutes(app);
setDoorRoutes(app);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});