import { pgTable, text, integer, boolean, timestamp } from 'drizzle-orm/pg-core';
import { timestamps } from './shared.js';

export const linksTable = pgTable('links', {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    url: text().notNull(),
    title: text(),
    channelName: text(),
    englishSubtitles: boolean(),
    subtitleCheckedAt: timestamps.subtitleCheckedAt,
    refreshAvailableAt: timestamp('refresh_available_at'),
    notifiedAt: timestamps.notifiedAt,
    createdAt: timestamps.createdAt
});