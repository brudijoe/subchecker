import { relations } from 'drizzle-orm';
import { pgTable, text, integer, timestamp } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    email: text().notNull().unique(),
});

export const links = pgTable('links', {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    url: text().notNull(),
    userId: integer('user_id')
        .notNull()
        .references(() => users.id, { onDelete: 'cascade' }), // Fremdschlüssel
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// Relationen für die Query-API
export const usersRelations = relations(users, ({ many }) => ({
    links: many(links),
}));

export const linksRelations = relations(links, ({ one }) => ({
    user: one(users, {
        fields: [links.userId],
        references: [users.id],
    }),
}));