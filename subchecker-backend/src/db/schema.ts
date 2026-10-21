import { pgTable, text, integer } from 'drizzle-orm/pg-core';
import { timestamps } from './shared.js';

export const linksTable = pgTable('links', {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    url: text().notNull(),
    createdAt: timestamps.createdAt
});