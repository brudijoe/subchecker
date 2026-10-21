import { Hono } from 'hono';
import { eq } from 'drizzle-orm';
import { db } from './db/index.js';
import { linksTable } from './db/schema.js';

const app = new Hono();

// Return all links saved in PostgreSQL.
app.get('/', async (context) => {
    const links = await db
        .select()
        .from(linksTable)
        .limit(100);

    return context.json({ links });
});

// Add links to PostgreSQL.
app.post('/', async (context) => {
    const body = await context.req.json<{ url: string }>();

    const [link] = await db
        .insert(linksTable)
        .values({ url: body.url })
        .returning();

    return context.json(link, 201);
});

// Remove one link by its database ID.
app.delete('/:id', async (context) => {
    const id = Number(context.req.param('id'));

    await db
        .delete(linksTable)
        .where(eq(linksTable.id, id));

    return context.body(null, 204);
});


export default app;