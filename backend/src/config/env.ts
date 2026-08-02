import dotenv from 'dotenv';

dotenv.config();

export const env = {
  PORT: Number(process.env.PORT ?? 5000),
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  JWT_SECRET: process.env.JWT_SECRET ?? 'development-secret-change-me',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN ?? '24h',
  MONGO_URI: process.env.MONGO_URI ?? 'mongodb://127.0.0.1:27017/attendance-monitoring',
  CLIENT_URL: process.env.CLIENT_URL ?? 'http://localhost:5173',
  SMTP_HOST: process.env.SMTP_HOST ?? 'smtp.gmail.com',
  SMTP_PORT: Number(process.env.SMTP_PORT ?? 587),
  SMTP_USER: process.env.SMTP_USER ?? '',
  SMTP_PASS: process.env.SMTP_PASS ?? '',
  SMTP_FROM: process.env.SMTP_FROM ?? 'attendance.monitor@example.com',
};
