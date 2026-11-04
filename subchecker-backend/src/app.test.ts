import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { db } from './db/index.js';
import app from './app.js';
import { getYouTubeThumbnailUrl } from './lib/youtube.js';

describe('YouTube helpers', () => {
    it('gets thumbnail URLs from YouTube link formats', () => {
        const videoId = 'wfaL-baiNUo';

        assert.equal(
            getYouTubeThumbnailUrl(`https://www.youtube.com/watch?v=${videoId}`),
            `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
        );
        assert.equal(
            getYouTubeThumbnailUrl(`https://youtu.be/${videoId}`),
            `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
        );
        assert.equal(getYouTubeThumbnailUrl('https://example.com/video'), null);
    });
});

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
        const links = [{ id: 1, url: 'https://www.youtube.com/watch?v=wfaL-baiNUo' }];
        t.mock.method(db, 'select', () => ({
            from: () => ({
                orderBy: () => ({ limit: async () => links }),
            }),
        }));

        const response = await app.request('/links');

        assert.equal(response.status, 200);
        assert.deepEqual(await response.json(), {
            links: [{
                ...links[0],
                thumbnailUrl: 'https://i.ytimg.com/vi/wfaL-baiNUo/hqdefault.jpg',
            }],
        });
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
        assert.deepEqual(await response.json(), { ...savedLink, thumbnailUrl: null });
    });

    it('includes the thumbnail when the initial check fails', async (t) => {
        const savedLink = { id: 8, url: 'https://www.youtube.com/watch?v=wfaL-baiNUo' };
        t.mock.method(db, 'insert', () => ({
            values: () => ({ returning: async () => [savedLink] }),
        }));
        t.mock.method(db, 'select', () => {
            throw new Error('check failed');
        });
        t.mock.method(console, 'error', () => undefined);

        const response = await app.request('/links', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: savedLink.url }),
        });

        assert.equal(response.status, 201);
        assert.deepEqual(await response.json(), {
            ...savedLink,
            thumbnailUrl: 'https://i.ytimg.com/vi/wfaL-baiNUo/hqdefault.jpg',
        });
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