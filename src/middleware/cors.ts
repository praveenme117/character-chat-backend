import cors from 'cors';
import { env } from '../config/env';

// Configurable CORS. Defaults to permissive in development to preserve current behavior.
const corsMiddleware = cors({
  origin: env.CORS_ORIGIN ? env.CORS_ORIGIN.split(',').map((o) => o.trim()) : true,
  credentials: true,
});

export default corsMiddleware;


