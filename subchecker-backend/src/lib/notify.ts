type Notification = {
    title: string;
    channelName?: string | null;
    url: string;
};

export async function sendNotification({ title, channelName, url }: Notification): Promise<void> {
    const topic = process.env.NTFY_TOPIC;
    if (!topic) throw new Error('NTFY_TOPIC is missing');

    const server = (process.env.NTFY_SERVER ?? 'https://ntfy.sh').replace(/\/+$/, '');
    const bodyLines = [
        channelName,
        title || 'YouTube video',
        url,
    ].filter((line): line is string => Boolean(line));

    const response = await fetch(`${server}/${encodeURIComponent(topic)}`, {
        method: 'POST',
        headers: {
            Title: 'English subtitles available',
        },
        body: bodyLines.join('\n'),
    });

    if (!response.ok) throw new Error(`ntfy returned HTTP ${response.status}`);
}