import { useCheckLink, useDeleteLink, useLinks } from "@/hooks/useLinks";
import type { LinkDto } from "@/types/types";
import { LinkCard, LinkCardSkeleton } from "@/pages/link-card";

function sortLinks(links: LinkDto[]) {
    return links.toSorted((leftLink, rightLink) =>
        Number(rightLink.englishSubtitles === true) - Number(leftLink.englishSubtitles === true)
        || leftLink.id - rightLink.id
    );
}

export function LinkList() {
    const { data: links = [], isPending, isError } = useLinks();
    const checkMutation = useCheckLink();
    const deleteMutation = useDeleteLink();

    if (isPending) {
        return (
            <div className="grid gap-3 md:grid-cols-2" role="status" aria-label="Loading links">
                <LinkCardSkeleton />
                <LinkCardSkeleton />
            </div>
        );
    }

    if (isError || links.length === 0) {
        const message = isError ? "The links could not be loaded." : "No links added yet.";
        return <div className="rounded-xl border p-4 text-sm">{message}</div>;
    }

    return (
        <div className="grid gap-3 md:grid-cols-2">
            {sortLinks(links).map((link) => (
                <LinkCard
                    key={link.id}
                    link={link}
                    isChecking={checkMutation.isPending && checkMutation.variables === link.id}
                    isDeleting={deleteMutation.isPending}
                    onDelete={() => deleteMutation.mutate(link.id)}
                    onCheck={() => checkMutation.mutate(link.id)}
                />
            ))}
        </div>
    );
}
