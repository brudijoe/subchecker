import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { checkLink, createLink, deleteLink, fetchLinks } from "@/api/links";

export function useLinks() {
    return useQuery({
        queryKey: ["links"],
        queryFn: fetchLinks,
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        staleTime: Infinity
    });
}

export function useCreateLink() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createLink,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["links"] }),
    });
}

export function useCheckLink() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: checkLink,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["links"] }),
    });
}

export function useDeleteLink() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteLink,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["links"] }),
    });
}

