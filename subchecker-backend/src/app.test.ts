import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { db } from './db/index.js';
import app from './app.js';
import { fetchSubtitleInfo } from './lib/fetchSubtitleInfo.js';
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

describe('YouTube video metadata', () => {
    it('extracts the channel name from the player response', async (t) => {
        const player = {
            videoDetails: { title: 'Video title', author: 'Example Channel' },
            captions: { playerCaptionsTracklistRenderer: { captionTracks: [] } },
        };
        t.mock.method(globalThis, 'fetch', async () => new Response(
            `ytInitialPlayerResponse = ${JSON.stringify(player)};`,
            { status: 200 },
        ));

        assert.deepEqual(
            await fetchSubtitleInfo('https://youtube.com/watch?v=wfaL-baiNUo'),
            {
                title: 'Video title',
                channelName: 'Example Channel',
                hasEnglishSubtitles: false,
            },
        );
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
        const links = [{
            id: 1,
            url: 'https://www.youtube.com/watch?v=wfaL-baiNUo',
            channelName: null,
        }];
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
        const savedLink = { id: 7, url: 'https://example.com/video', channelName: null };
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
        const savedLink = {
            id: 8,
            url: 'https://www.youtube.com/watch?v=wfaL-baiNUo',
            channelName: null,
        };
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
        t.mock.method(db, 'update', () => ({
            set: () => ({ where: () => ({ returning: async () => [] }) }),
        }));
        t.mock.method(db, 'select', () => ({
            from: () => ({ where: () => ({ limit: async () => [] }) }),
        }));

        const response = await app.request('/links/123/check', { method: 'POST' });

        assert.equal(response.status, 404);
        assert.deepEqual(await response.json(), { error: 'Link not found' });
    });

    it('saves a server-side cooldown when a link is refreshed', async (t) => {
        const link = {
            id: 123,
            url: 'https://youtube.com/watch?v=wfaL-baiNUo',
            title: null,
            channelName: null,
            englishSubtitles: null,
            subtitleCheckedAt: null,
            refreshAvailableAt: null as Date | null,
            notifiedAt: null,
            createdAt: new Date(),
            updatedAt: new Date(),
            deletedAt: null,
        };
        let savedLink = { ...link };
        t.mock.method(db, 'update', () => {
            let values: Record<string, unknown>;
            return {
                set: (nextValues: Record<string, unknown>) => {
                    values = nextValues;
                    return {
                        where: () => ({
                            returning: async () => {
                                savedLink = { ...savedLink, ...values };
                                return [savedLink];
                            },
                        }),
                    };
                },
            };
        });
        t.mock.method(db, 'select', () => ({
            from: () => ({
                where: () => ({ limit: async () => [savedLink] }),
            }),
        }));
        t.mock.method(globalThis, 'fetch', async () => new Response(
            `ytInitialPlayerResponse = ${JSON.stringify({
                videoDetails: { title: 'Video title', author: 'Example Channel' },
                captions: { playerCaptionsTracklistRenderer: { captionTracks: [] } },
            })};`,
            { status: 200 },
        ));

        const response = await app.request('/links/123/check', { method: 'POST' });

        assert.equal(response.status, 200);
        const body = await response.json();
        assert.equal(typeof body.refreshAvailableAt, 'string');
        assert.equal(savedLink.refreshAvailableAt?.getTime(), Date.parse(body.refreshAvailableAt));
    });

    it('rejects a refresh while the server-side cooldown is active', async (t) => {
        const refreshAvailableAt = new Date(Date.now() + 60_000);
        t.mock.method(db, 'update', () => ({
            set: () => ({ where: () => ({ returning: async () => [] }) }),
        }));
        t.mock.method(db, 'select', () => ({
            from: () => ({ where: () => ({ limit: async () => [{ refreshAvailableAt }] }) }),
        }));

        const response = await app.request('/links/123/check', { method: 'POST' });

        assert.equal(response.status, 429);
        assert.equal(response.headers.get('Retry-After'), '60');
        assert.deepEqual(await response.json(), {
            error: 'Refresh cooldown active',
            refreshAvailableAt: refreshAvailableAt.toISOString(),
        });
    });

    it('deletes a link and returns no content', async (t) => {
        t.mock.method(db, 'delete', () => ({ where: async () => undefined }));

        const response = await app.request('/links/123', { method: 'DELETE' });

        assert.equal(response.status, 204);
        assert.equal(await response.text(), '');
    });
});