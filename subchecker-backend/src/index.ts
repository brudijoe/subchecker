import 'dotenv/config';
import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import links from './links.js';
import health from './health.js';
import { startSubtitleChecker } from './lib/subtitleChecker.js';

const app = new Hono();

app.use('*', cors({
  origin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
  allowMethods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type'],
}));

app.route('/health', health);
app.route('/links', links);

const port = Number(process.env.PORT ?? 3000);

serve({
  fetch: app.fetch,
  port
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}/links`)
  startSubtitleChecker();
});

export default app;