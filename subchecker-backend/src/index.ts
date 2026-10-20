import 'dotenv/config';
import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { db } from './db/index.js';
import { users, links } from './db/schema.js';

const app = new Hono();

app.get('/', (c) => {
  return c.text('Hello Hono!');
});

// User mit Links erstellen
app.post('/users', async (c) => {
  const { email, links: linkUrls } = await c.req.json<{ email: string; links?: string[] }>();

  const [newUser] = await db.insert(users).values({ email }).returning();

  if (linkUrls && linkUrls.length > 0) {
    await db.insert(links).values(
      linkUrls.map((url) => ({ url, userId: newUser.id }))
    );
  }

  return c.json(newUser, 201);
});

// Alle User mit ihren Links abrufen (1:n aufgelöst)
app.get('/users', async (c) => {
  const usersWithLinks = await db.query.users.findMany({
    with: {
      links: true, // Löst die 1:n-Beziehung auf
    },
  });
  return c.json(usersWithLinks);
});

const port = Number(process.env.PORT ?? 3000);

serve({
  fetch: app.fetch,
  port
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})

export default app;