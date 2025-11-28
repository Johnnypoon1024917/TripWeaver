import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import dotenv from 'dotenv';
import { AppDataSource } from './config/database';
import { connectRedis } from './config/redis';
import authRoutes from './routes/auth';
import tripRoutes from './routes/trips';
import placesRoutes from './routes/places';
import { rateLimiter } from './middleware/rateLimiter';
import { gdprCompliance, securityLogger, corsOptions } from './middleware/security';
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;
const API_PREFIX = process.env.API_PREFIX || '/api/v1';
// Middleware
app.use(helmet());
app.use(cors(corsOptions));
app.use(compression());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(gdprCompliance);
app.use(securityLogger);
app.use(rateLimiter.middleware);
// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
// Routes
app.use(`${API_PREFIX}/auth`, authRoutes);
app.use(`${API_PREFIX}/trips`, tripRoutes);
app.use(`${API_PREFIX}/places`, placesRoutes);
// 404 handler
app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});
// Initialize database and start server
const startServer = async () => {
    try {
        // Connect to PostgreSQL
        await AppDataSource.initialize();
        console.log('✅ Database connected');
        // Connect to Redis
        await connectRedis();
        console.log('✅ Redis connected');
        // Start server
        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`📍 API endpoints: http://localhost:${PORT}${API_PREFIX}`);
            console.log(`🏥 Health check: http://localhost:${PORT}/health`);
        });
    }
    catch (error) {
        console.error('❌ Error starting server:', error);
        process.exit(1);
    }
};
startServer();
export default app;
