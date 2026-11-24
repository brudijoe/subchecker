import type { LinkDto, LinkListDto } from "@/types/types";

export async function fetchLinks(): Promise<LinkDto[]> {
    const response = await fetch("/links");

    if (!response.ok) {
        throw new Error(`Failed to load links (${response.status})`);
    }

    const result = await response.json() as LinkListDto;
    return result.links;
}

export async function createLink(url: string): Promise<LinkDto> {
    const response = await fetch("/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
    });

    if (!response.ok) {
        if (response.status === 409) {
            const result = await response.json() as { error: string };
            throw new Error(result.error);
        }

        throw new Error(`Failed to create link (${response.status})`);
    }

    return response.json() as Promise<LinkDto>;
}

export async function deleteLink(id: number): Promise<void> {
    const response = await fetch(`/links/${id}`, {
        method: "DELETE",
    });

    if (!response.ok) {
        throw new Error(`Failed to delete link (${response.status})`);
    }
}

export async function checkLink(id: number): Promise<LinkDto> {
    const response = await fetch(`/links/${id}/check`, {
        method: 'POST',
    });

    if (!response.ok) {
        throw new Error(`Failed to check subtitles (${response.status})`);
    }

    return response.json() as Promise<LinkDto>;
}