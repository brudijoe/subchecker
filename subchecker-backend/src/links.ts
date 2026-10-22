import { Hono } from 'hono';
import { eq } from 'drizzle-orm';
import { db } from './db/index.js';
import { linksTable } from './db/schema.js';
import { checkLink } from './lib/subtitleChecker.js';

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

    try {
        return context.json(await checkLink(link.id) ?? link, 201);
    } catch (error) {
        console.error(`Could not check new link ${link.id}:`, error);
        return context.json(link, 201);
    }
});

app.post('/:id/check', async (context) => {
    const link = await checkLink(Number(context.req.param('id')));
    if (!link) return context.json({ error: 'Link not found' }, 404);
    return context.json(link);
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