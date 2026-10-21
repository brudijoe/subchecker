import { Hono } from 'hono'
import { sql } from 'drizzle-orm'
import { db } from './db/index.js';

export const app = new Hono()

// Check backend and database
app.get('/', async (context) => {
    try {
        await db.execute(sql`select 1`)

        return context.json({
            status: 'operational',
            checks: {
                api: 'ok',
                database: 'ok',
            },
            timestamp: new Date().toISOString(),
        })
    } catch {
        return context.json(
            {
                status: 'degraded',
                checks: {
                    api: 'ok',
                    database: 'error',
                },
                timestamp: new Date().toISOString(),
            },
            503,
        )
    }
});

export default app;