import { Hono } from 'hono';
import { and, asc, eq, isNull, lte, or } from 'drizzle-orm';
import { db } from './db/index.js';
import { linksTable } from './db/schema.js';
import { checkLink } from './lib/subtitleChecker.js';
import { getYouTubeThumbnailUrl, getYouTubeVideoId } from './lib/youtube.js';

const app = new Hono();
const REFRESH_COOLDOWN_MS = 5 * 60 * 1000;

function addLinkResponseFields<T extends { url: string; refreshAvailableAt?: Date | null }>(link: T) {
    const { refreshAvailableAt, ...linkData } = link;
    const refreshRemainingMs = Math.max(
        0,
        (refreshAvailableAt?.getTime() ?? 0) - Date.now(),
    );

    return {
        ...linkData,
        thumbnailUrl: getYouTubeThumbnailUrl(link.url),
        refreshRemainingMs,
    };
}

// Return all links saved in PostgreSQL.
app.get('/', async (context) => {
    const links = await db
        .select()
        .from(linksTable)
        .orderBy(asc(linksTable.id))
        .limit(100);

    return context.json({ links: links.map(addLinkResponseFields) });
});

// Add links to PostgreSQL.
app.post('/', async (context) => {
    const body = await context.req.json<{ url?: unknown }>();
    if (!body || typeof body !== 'object' || typeof body.url !== 'string') {
        return context.json({ error: 'Please provide a valid YouTube video URL.' }, 400);
    }

    const url = body.url.trim();
    if (!getYouTubeVideoId(url)) {
        return context.json({ error: 'Please provide a valid YouTube video URL.' }, 400);
    }

    const [existingLink] = await db
        .select({ id: linksTable.id })
        .from(linksTable)
        .where(eq(linksTable.url, url))
        .limit(1);

    if (existingLink) {
        return context.json({ error: 'This link has already been added.' }, 409);
    }

    const [link] = await db
        .insert(linksTable)
        .values({ url })
        .returning();

    try {
        return context.json(addLinkResponseFields(await checkLink(link.id) ?? link), 201);
    } catch (error) {
        console.error(`Could not check new link ${link.id}:`, error);
        return context.json(addLinkResponseFields(link), 201);
    }
});

// Recheck a saved link on demand.
app.post('/:id/check', async (context) => {
    const id = Number(context.req.param('id'));
    const now = new Date();
    const refreshAvailableAt = new Date(now.getTime() + REFRESH_COOLDOWN_MS);

    // Atomically claim this link's refresh slot to prevent parallel requests
    // from bypassing the cooldown.
    const [claimedLink] = await db
        .update(linksTable)
        .set({ refreshAvailableAt })
        .where(and(
            eq(linksTable.id, id),
            or(
                isNull(linksTable.refreshAvailableAt),
                lte(linksTable.refreshAvailableAt, now),
            ),
        ))
        .returning();

    if (!claimedLink) {
        const [existingLink] = await db
            .select({ refreshAvailableAt: linksTable.refreshAvailableAt })
            .from(linksTable)
            .where(eq(linksTable.id, id))
            .limit(1);

        if (!existingLink) return context.json({ error: 'Link not found' }, 404);

        const availableAt = existingLink.refreshAvailableAt ?? refreshAvailableAt;
        const retryAfter = Math.max(1, Math.ceil((availableAt.getTime() - Date.now()) / 1000));
        context.header('Retry-After', String(retryAfter));
        return context.json({
            error: 'Refresh cooldown active',
        }, 429);
    }

    const link = await checkLink(id);
    if (!link) return context.json({ error: 'Link not found' }, 404);
    return context.json(addLinkResponseFields(link));
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