import { type NextFunction, type Request, type RequestHandler, type Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { type AuthenticatedUser, type UserRole } from '../types/index.js';

interface JwtPayload extends AuthenticatedUser {}

export const requireAuth: RequestHandler = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ success: false, message: 'Missing or invalid authorization token' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ success: false, message: 'Token expired or invalid' });
  }
};

export const requireRole = (...allowedRoles: UserRole[]): RequestHandler => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      res.status(403).json({ success: false, message: 'You do not have access to this resource' });
      return;
    }

    next();
  };
};
