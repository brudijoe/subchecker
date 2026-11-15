import type { components } from "@/api/generated/openapi";

export type LinkDto = components["schemas"]["Link"];
export type LinkListDto = components["schemas"]["LinkList"];

export type LinkProps = {
    link: LinkDto;
}

export type LinkRowProps = LinkProps & {
    isChecking: boolean;
    isDeleting: boolean;
    onDelete: () => void;
    onCheck: () => void;
};