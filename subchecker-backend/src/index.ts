import 'dotenv/config';
import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import links from './links.js';

const app = new Hono();

app.route('/links', links)

const port = Number(process.env.PORT ?? 3000);

serve({
  fetch: app.fetch,
  port
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}/links`)
})

export default app;