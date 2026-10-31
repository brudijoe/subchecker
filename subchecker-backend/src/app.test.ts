import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { db } from './db/index.js';
import app from './app.js';

describe('backend routes', () => {
    it('returns operational status when the database responds', async (t) => {
        t.mock.method(db, 'execute', async () => undefined);

        const response = await app.request('/health');

        assert.equal(response.status, 200);
        const body = await response.json();
        assert.equal(body.status, 'operational');
        assert.deepEqual(body.checks, {
            api: 'ok',
            database: 'ok',
        });
    });

    it('returns degraded status when the database fails', async (t) => {
        t.mock.method(db, 'execute', async () => {
            throw new Error('database unavailable');
        });

        const response = await app.request('/health');

        assert.equal(response.status, 503);
        const body = await response.json();
        assert.equal(body.status, 'degraded');
        assert.deepEqual(body.checks, { api: 'ok', database: 'error' });
        assert.equal(typeof body.timestamp, 'string');
    });

    it('returns saved links', async (t) => {
        const links = [{ id: 1, url: 'https://example.com/video' }];
        t.mock.method(db, 'select', () => ({
            from: () => ({ limit: async () => links }),
        }));

        const response = await app.request('/links');

        assert.equal(response.status, 200);
        assert.deepEqual(await response.json(), { links });
    });

    it('creates a link and returns it when checking finds no update', async (t) => {
        const savedLink = { id: 7, url: 'https://example.com/video' };
        t.mock.method(db, 'insert', () => ({
            values: () => ({ returning: async () => [savedLink] }),
        }));
        t.mock.method(db, 'select', () => ({
            from: () => ({ where: () => ({ limit: async () => [] }) }),
        }));

        const response = await app.request('/links', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: savedLink.url }),
        });

        assert.equal(response.status, 201);
        assert.deepEqual(await response.json(), savedLink);
    });

    it('returns 404 when a link to recheck does not exist', async (t) => {
        t.mock.method(db, 'select', () => ({
            from: () => ({ where: () => ({ limit: async () => [] }) }),
        }));

        const response = await app.request('/links/123/check', { method: 'POST' });

        assert.equal(response.status, 404);
        assert.deepEqual(await response.json(), { error: 'Link not found' });
    });

    it('deletes a link and returns no content', async (t) => {
        t.mock.method(db, 'delete', () => ({ where: async () => undefined }));

        const response = await app.request('/links/123', { method: 'DELETE' });

        assert.equal(response.status, 204);
        assert.equal(await response.text(), '');
    });
});