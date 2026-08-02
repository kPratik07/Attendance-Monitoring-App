import cors from 'cors';
import express, { type NextFunction, type Request, type Response } from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env.js';
import { authRoutes } from './routes/auth.routes.js';
import { studentRoutes } from './routes/student.routes.js';
import { adminRoutes } from './routes/admin.routes.js';
import { notificationRoutes } from './routes/notification.routes.js';
import { dashboardRoutes } from './routes/dashboard.routes.js';
import { lookupRoutes } from './routes/lookup.routes.js';
import { notFoundHandler } from './middleware/not-found.js';
import { errorHandler } from './middleware/error-handler.js';

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
  }),
);
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

app.get('/api/health', (_req, res) => {
  res.json({ success: true, message: 'Attendance API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/lookup', lookupRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export { app };
