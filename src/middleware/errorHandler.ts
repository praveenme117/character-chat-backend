import express from 'express';

export default function errorHandler(
  err: any,
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  console.error('Unexpected error:', err.stack);
  res.status(500).json({ error: 'Internal server error' });
}
