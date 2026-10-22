type Notification = {
    title: string;
    url: string;
};

export async function sendNotification({ title, url }: Notification): Promise<void> {
    const topic = process.env.NTFY_TOPIC;
    if (!topic) throw new Error('NTFY_TOPIC is missing');

    const server = (process.env.NTFY_SERVER ?? 'https://ntfy.sh').replace(/\/+$/, '');
    const response = await fetch(`${server}/${encodeURIComponent(topic)}`, {
        method: 'POST',
        headers: {
            Title: 'English subtitles available',
            Click: url,
        },
        body: `${title || 'YouTube video'}\n${url}`,
    });

    if (!response.ok) throw new Error(`ntfy returned HTTP ${response.status}`);
}