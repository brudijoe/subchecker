import { pgTable, text, integer, boolean } from 'drizzle-orm/pg-core';
import { timestamps } from './shared.js';

export const linksTable = pgTable('links', {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    url: text().notNull(),
    title: text(),
    englishSubtitles: boolean(),
    subtitleCheckedAt: timestamps.subtitleCheckedAt,
    notifiedAt: timestamps.notifiedAt,
    createdAt: timestamps.createdAt
});