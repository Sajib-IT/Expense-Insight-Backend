import express from 'express';
import cors from 'cors';
import httpStatus from 'http-status';
import router from './app/routes';
import globalErrorHandler from './app/middlewares/globalErrorHandler';

const app = express();

// Parsers
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files (for receipt uploads)
// app.use('/uploads', express.static('uploads'));

// Health check
app.get('/health', (_req, res) => {
  res.status(httpStatus.OK).json({
    success: true,
    message: 'Expense Insight API is running',
    timestamp: new Date().toISOString(),
  });
});

// API routes
app.use('/api/v1', router);

// Handle 404
app.use((_req, res) => {
  res.status(httpStatus.NOT_FOUND).json({
    success: false,
    message: 'Route not found',
    errorMessages: [{ path: _req.originalUrl, message: 'API route does not exist' }],
  });
});

// Global error handler
app.use(globalErrorHandler);

export default app;
