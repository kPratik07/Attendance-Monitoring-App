import { type NextFunction, type Request, type Response } from 'express';

export const errorHandler = (
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  console.error(error);
  res.status(500).json({
    success: false,
    message: error.message || 'Internal Server Error',
  });
};
