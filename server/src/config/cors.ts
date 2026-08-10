import cors from 'cors';
import { env } from './env';

export const corsOptions: cors.CorsOptions = {
  origin: env.CORS_ORIGIN,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
  credentials: true, // Allow cookies if needed later
  maxAge: 86400, // Cache preflight response for 24 hours
};
