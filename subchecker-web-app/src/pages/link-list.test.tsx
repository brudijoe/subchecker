import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { LinkDto } from "@/types/types";
import { LinkList } from "./link-list";

const mocks = vi.hoisted(() => ({
    useCheckLink: vi.fn(),
    useDeleteLink: vi.fn(),
    useLinks: vi.fn(),
    checkLink: vi.fn(),
    deleteLink: vi.fn(),
}));

vi.mock("@/hooks/useLinks", () => ({
    useCheckLink: mocks.useCheckLink,
    useDeleteLink: mocks.useDeleteLink,
    useLinks: mocks.useLinks,
}));

const firstLink: LinkDto = {
    id: 1,
    url: "https://youtube.com/watch?v=first",
    thumbnailUrl: "https://i.ytimg.com/vi/first/hqdefault.jpg",
    title: "First video",
    channelName: null,
    englishSubtitles: true,
    subtitleCheckedAt: null,
    refreshRemainingMs: 0,
    notifiedAt: null,
    createdAt: "2026-01-01T00:00:00.000Z",
};

const secondLink: LinkDto = {
    id: 2,
    url: "https://youtube.com/watch?v=second",
    thumbnailUrl: null,
    title: null,
    channelName: null,
    englishSubtitles: null,
    subtitleCheckedAt: null,
    refreshRemainingMs: 0,
    notifiedAt: null,
    createdAt: "2026-01-01T00:00:00.000Z",
};

function configureHooks(linksState: object, checkState = {}, deleteState = {}) {
    mocks.useLinks.mockReturnValue(linksState);
    mocks.useCheckLink.mockReturnValue({ mutate: mocks.checkLink, ...checkState });
    mocks.useDeleteLink.mockReturnValue({ mutate: mocks.deleteLink, ...deleteState });
}

beforeEach(() => {
    configureHooks({ data: [], isPending: false, isError: false });
    mocks.checkLink.mockReset();
    mocks.deleteLink.mockReset();
});

describe("LinkList", () => {
    it("shows loading cards while links are pending", () => {
        configureHooks({ data: undefined, isPending: true, isError: false });

        render(<LinkList />);

        const loading = screen.getByRole("status", { name: "Loading links" });
        const cards = loading.querySelectorAll('[data-slot="card"]');
        expect(cards).toHaveLength(2);
        const thumbnailPlaceholder = cards[0].querySelector(".aspect-video");
        expect(thumbnailPlaceholder?.parentElement).toHaveClass("mx-3", "overflow-hidden", "rounded-xl");
        expect(screen.queryByText("No links added yet.")).not.toBeInTheDocument();
    });

    it("shows error and empty states without cards", () => {
        configureHooks({ data: undefined, isPending: false, isError: true });
        const { rerender } = render(<LinkList />);

        expect(screen.getByText("The links could not be loaded.")).toBeInTheDocument();
        expect(screen.queryByRole("table")).not.toBeInTheDocument();

        configureHooks({ data: [], isPending: false, isError: false });
        rerender(<LinkList />);

        expect(screen.getByText("No links added yet.")).toBeInTheDocument();
    });

    it("renders all links as cards and sorts available subtitles first", () => {
        configureHooks({ data: [secondLink, firstLink], isPending: false, isError: false });

        render(<LinkList />);

        const cards = screen.getAllByTestId(/link-card-/);
        expect(cards).toHaveLength(2);
        expect(within(cards[0]).getByRole("link", { name: "First video" })).toHaveAttribute("href", firstLink.url);
        expect(within(cards[1]).getByRole("link", { name: secondLink.url })).toHaveAttribute("href", secondLink.url);
    });

    it("checks links and deletes them only after confirmation", async () => {
        const user = userEvent.setup();
        configureHooks({ data: [secondLink], isPending: false, isError: false });
        render(<LinkList />);

        const card = screen.getByTestId("link-card-2");
        await user.click(within(card).getByRole("button", { name: "Refresh link" }));
        expect(mocks.checkLink).toHaveBeenCalledWith(secondLink.id);

        await user.click(within(card).getByRole("button", { name: "Delete link" }));
        expect(mocks.deleteLink).not.toHaveBeenCalled();

        await user.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Delete link" }));
        expect(mocks.deleteLink).toHaveBeenCalledWith(secondLink.id);
    });
});
