import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { testDbConnection } from './config/db.js';

// Route Imports
import authRoutes from './routes/authRoutes.js';
import creationsRoutes from './routes/creationsRoutes.js';
import organizationsRoutes from './routes/organizationsRoutes.js';
import workExperienceRoutes from './routes/workExperienceRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.SERVER_PORT || process.env.PORT || 5000;

// Allowed Origins for CORS with credentials
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:1234',
  'http://localhost:3000',
  'http://127.0.0.1:1234',
  'http://127.0.0.1:3000',
].filter(Boolean);

// Middlewares
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps, curl, or Postman)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`CORS policy does not allow access from origin: ${origin}`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'portfolio-backend-api',
  });
});

// Mount API Route Endpoints
app.use('/api/auth', authRoutes);
app.use('/api/creations', creationsRoutes);
app.use('/api/organizations', organizationsRoutes);
app.use('/api/work-experiences', workExperienceRoutes);
app.use('/api/upload', uploadRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error.',
  });
});

// Start Server & Test Database Connection
app.listen(PORT, async () => {
  console.log(`🚀 Portfolio API Server listening on port http://localhost:${PORT}`);
  await testDbConnection();
});

export default app;
