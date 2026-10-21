export type Link = {
    title: string;
    hasSubs: boolean;
}

export type LinkDto = {
    id: number;
    url: string;
};

export type LinkProps = {
    link: LinkDto;
}

export type LinkRowProps = LinkProps & {
    check: {
        data: Link | undefined;
        isPending: boolean;
        isError: boolean;
        isFetching: boolean;
        refetch: () => unknown;
    };
    isDeleting: boolean;
    onDelete: () => void;
};