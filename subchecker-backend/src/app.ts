import { Hono } from 'hono';
import { cors } from 'hono/cors';
import links from './links.js';
import health from './health.js';

const app = new Hono();

app.use('*', cors({
    origin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
    allowMethods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type'],
}));

app.route('/health', health);
app.route('/links', links);

export default app;