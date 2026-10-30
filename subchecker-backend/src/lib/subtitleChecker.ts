import { eq } from 'drizzle-orm';
import { db } from '../db/index.js';
import { linksTable } from '../db/schema.js';
import { fetchSubtitleInfo } from './fetchSubtitleInfo.js';
import { sendNotification } from './notify.js';

// Check one link and notify when English subtitles are available
export async function checkLink(id: number) {
    // Load the saved link to get its URL and notification state
    const [link] = await db
        .select()
        .from(linksTable)
        .where(eq(linksTable.id, id))
        .limit(1);

    if (!link) return null;

    // Fetch the latest subtitle information for this URL
    const info = await fetchSubtitleInfo(link.url);

    // Save the latest title, subtitle status, and check time
    const [checkedLink] = await db
        .update(linksTable)
        .set({
            title: info.title,
            englishSubtitles: info.hasEnglishSubtitles,
            subtitleCheckedAt: new Date(),
        })
        .where(eq(linksTable.id, id))
        .returning();

    // Notify only if subtitles are available and no notification was sent before
    if (info.hasEnglishSubtitles && !link.notifiedAt) {
        try {
            await sendNotification({ title: info.title, url: link.url });
            const [notifiedLink] = await db
                .update(linksTable)
                .set({ notifiedAt: new Date() })
                .where(eq(linksTable.id, id))
                .returning();
            return notifiedLink;
        } catch (error) {
            console.error(`Could not send notification for link ${id}:`, error);
        }
    }

    return checkedLink;
}

let isChecking = false;

async function checkAllLinks(): Promise<void> {
    if (isChecking) return;
    isChecking = true;

    try {
        const links = await db.select({ id: linksTable.id }).from(linksTable);

        for (const link of links) {
            try {
                await checkLink(link.id);
            } catch (error) {
                console.error(`Could not check link ${link.id}:`, error);
            }
        }
    } catch (error) {
        console.error('Could not load links for subtitle checks:', error);
    } finally {
        isChecking = false;
    }
}

export function startSubtitleChecker(): void {
    const oneHour = 1 * 60 * 60 * 1000;

    // Check saved links now and every six hours.
    void checkAllLinks();
    setInterval(() => void checkAllLinks(), oneHour).unref();
}