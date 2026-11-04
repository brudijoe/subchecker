export type LinkDto = {
    id: number;
    url: string;
    thumbnailUrl: string | null;
    title: string | null;
    englishSubtitles: boolean | null;
    subtitleCheckedAt: string | null;
    notifiedAt: string | null;
};

export type LinkProps = {
    link: LinkDto;
}

export type LinkRowProps = LinkProps & {
    isChecking: boolean;
    isDeleting: boolean;
    onDelete: () => void;
    onCheck: () => void;
};