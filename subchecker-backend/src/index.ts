import 'dotenv/config';
import { serve } from '@hono/node-server';
import { Hono } from 'hono';

const app = new Hono();

app.get('/', (context) => {
  return context.text('Hello Hono!');
});

const port = Number(process.env.PORT ?? 3000);

serve({
  fetch: app.fetch,
  port
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})

export default app;