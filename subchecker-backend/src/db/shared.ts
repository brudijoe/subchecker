import { timestamp } from 'drizzle-orm/pg-core';

export const timestamps = {
    notifiedAt: timestamp('notified_at'),
    subtitleCheckedAt: timestamp('subtitle_checked_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull().$onUpdateFn(() => new Date()),
    deletedAt: timestamp('deleted_at'),
};