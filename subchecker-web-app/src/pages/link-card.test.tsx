import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { LinkDto, LinkRowProps } from "@/types/types";
import { LinkCard } from "./link-card";

const link: LinkDto = {
    id: 1,
    url: "https://youtube.com/watch?v=first",
    thumbnailUrl: "https://i.ytimg.com/vi/first/hqdefault.jpg",
    title: "First video",
    channelName: "Example Channel",
    englishSubtitles: true,
    subtitleCheckedAt: null,
    refreshRemainingMs: 0,
    notifiedAt: null,
    createdAt: "2026-01-01T00:00:00.000Z",
};

function renderCard(overrides: Partial<LinkRowProps> = {}) {
    const props: LinkRowProps = {
        link,
        isChecking: false,
        isDeleting: false,
        onDelete: vi.fn(),
        onCheck: vi.fn(),
        ...overrides,
    };

    return { ...render(<LinkCard {...props} />), props };
}

describe("LinkCard", () => {
    it("shows subtitle status, channel, title and a high-quality thumbnail", () => {
        const { container } = renderCard();
        const card = screen.getByTestId("link-card-1");

        expect(within(card).getByRole("img", { name: "English subtitles available" })).toBeInTheDocument();
        expect(within(card).getByRole("link", { name: "First video" })).toHaveAttribute("href", link.url);
        expect(within(card).getByRole("img", { name: "Thumbnail for First video" })).toHaveAttribute(
            "src",
            "https://i.ytimg.com/vi/first/maxresdefault.jpg",
        );
        expect(within(card).getByText("Example Channel")).toBeInTheDocument();
        const thumbnail = container.querySelector("img");
        expect(thumbnail).toHaveClass("w-full");
        expect(thumbnail?.parentElement).toHaveClass("mx-3", "overflow-hidden", "rounded-xl");
        expect(within(card).queryByRole("button", { name: "Refresh link" })).not.toBeInTheDocument();
        expect(within(card).getAllByRole("button").map((button) => button.textContent?.trim())).toEqual(["Delete link"]);
    });

    it("falls back to the available thumbnail when the higher-quality image is missing", () => {
        renderCard();
        const image = screen.getByRole("img", { name: "Thumbnail for First video" });

        fireEvent.error(image);

        expect(image).toHaveAttribute("src", link.thumbnailUrl);
    });

    it("checks a link and asks for confirmation before deleting", async () => {
        const user = userEvent.setup();
        const { props } = renderCard({ link: { ...link, englishSubtitles: false } });
        const card = screen.getByTestId("link-card-1");

        await user.click(within(card).getByRole("button", { name: "Refresh link" }));
        expect(props.onCheck).toHaveBeenCalledOnce();

        await user.click(within(card).getByRole("button", { name: "Delete link" }));
        const dialog = screen.getByRole("dialog");
        expect(within(dialog).getByText("Delete this link?")).toBeInTheDocument();
        expect(props.onDelete).not.toHaveBeenCalled();

        await user.click(within(dialog).getByRole("button", { name: "Delete link" }));
        expect(props.onDelete).toHaveBeenCalledOnce();
    });

    it("confirms before opening the video on YouTube", async () => {
        const user = userEvent.setup();
        renderCard();

        await user.click(screen.getByRole("link", { name: "First video" }));
        const dialog = screen.getByRole("dialog");
        expect(within(dialog).getByText("Open this link on YouTube?")).toBeInTheDocument();
        expect(within(dialog).getByRole("link", { name: "Continue to YouTube" })).toHaveAttribute(
            "href",
            link.url,
        );
    });

    it("omits the thumbnail when no thumbnail URL is available", () => {
        renderCard({ link: { ...link, thumbnailUrl: null } });

        expect(screen.queryByRole("img", { name: /thumbnail/i })).not.toBeInTheDocument();
    });
});
