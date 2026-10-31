import 'dotenv/config';
import { serve } from '@hono/node-server';
import app from './app.js';
import { startSubtitleChecker } from './lib/subtitleChecker.js';

const port = Number(process.env.PORT ?? 3000);

serve({
  fetch: app.fetch,
  port
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}/links`)
  startSubtitleChecker();
});

export default app;