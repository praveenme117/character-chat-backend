import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { logger } from '../lib/logger';

interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export default function errorHandler(
  err: AppError | ZodError,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  logger.error('Error occurred', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
  });

  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      error: 'Validation error',
      data: err.errors,
    });
  }

  const statusCode = (err as AppError).statusCode ?? 500;
  const message = statusCode === 500 ? 'Internal server error' : err.message;

  return res.status(statusCode).json({ success: false, error: message });
}
