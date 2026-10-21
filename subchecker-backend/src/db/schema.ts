import { pgTable, text, integer, timestamp } from 'drizzle-orm/pg-core';

export const links = pgTable('links', {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    url: text().notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});