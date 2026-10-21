import type { LinkDto } from "@/types/types";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export async function fetchLinks(): Promise<LinkDto[]> {
    const response = await fetch(`${API_URL}/links`);

    if (!response.ok) {
        throw new Error(`Links konnten nicht geladen werden (${response.status})`);
    }

    const result = await response.json() as { links: LinkDto[] };
    return result.links;
}

export async function createLink(url: string): Promise<LinkDto> {
    const response = await fetch(`${API_URL}/links`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
    });

    if (!response.ok) {
        throw new Error(`Link konnte nicht gespeichert werden (${response.status})`);
    }

    return response.json() as Promise<LinkDto>;
}

export async function deleteLink(id: number): Promise<void> {
    const response = await fetch(`${API_URL}/links/${id}`, {
        method: "DELETE",
    });

    if (!response.ok) {
        throw new Error(`Link konnte nicht gelöscht werden (${response.status})`);
    }
}