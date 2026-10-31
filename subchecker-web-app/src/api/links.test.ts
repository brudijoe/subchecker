import { afterEach, describe, expect, it, vi } from "vitest"
import { checkLink, createLink, deleteLink, fetchLinks } from "./links"

afterEach(() => {
    vi.unstubAllGlobals()
})

describe("links API", () => {
    it("loads links from the API", async () => {
        const links = [{ id: 1, url: "https://youtube.com/watch?v=abc", title: "Video" }]
        const fetchMock = vi.fn().mockResolvedValue(Response.json({ links }))
        vi.stubGlobal("fetch", fetchMock)

        await expect(fetchLinks()).resolves.toEqual(links)
        expect(fetchMock).toHaveBeenCalledWith("/links")
    })

    it("sends a link as JSON when creating a link", async () => {
        const createdLink = { id: 2, url: "https://youtube.com/watch?v=abc", title: null }
        const fetchMock = vi.fn().mockResolvedValue(Response.json(createdLink))
        vi.stubGlobal("fetch", fetchMock)

        await expect(createLink("https://youtube.com/watch?v=abc")).resolves.toEqual(createdLink)
        expect(fetchMock).toHaveBeenCalledWith("/links", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url: "https://youtube.com/watch?v=abc" }),
        })
    })

    it("deletes a link by id", async () => {
        const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 204 }))
        vi.stubGlobal("fetch", fetchMock)

        await expect(deleteLink(3)).resolves.toBeUndefined()
        expect(fetchMock).toHaveBeenCalledWith("/links/3", { method: "DELETE" })
    })

    it("checks subtitles for a link", async () => {
        const checkedLink = { id: 4, englishSubtitles: true }
        const fetchMock = vi.fn().mockResolvedValue(Response.json(checkedLink))
        vi.stubGlobal("fetch", fetchMock)

        await expect(checkLink(4)).resolves.toEqual(checkedLink)
        expect(fetchMock).toHaveBeenCalledWith("/links/4/check", { method: "POST" })
    })

    it.each([
        ["fetchLinks", () => fetchLinks(), "Links konnten nicht geladen werden (500)"],
        ["createLink", () => createLink("https://youtube.com/watch?v=abc"), "Link konnte nicht gespeichert werden (500)"],
        ["deleteLink", () => deleteLink(1), "Link konnte nicht gelöscht werden (500)"],
        ["checkLink", () => checkLink(1), "Untertitel konnten nicht geprüft werden (500)"],
    ])("surfaces HTTP failures for %s", async (_name, invoke, message) => {
        vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null, { status: 500 })))

        await expect(invoke()).rejects.toThrow(message)
    })
})