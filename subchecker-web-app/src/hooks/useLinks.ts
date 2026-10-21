import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import { createLink, deleteLink, fetchLinks } from "@/api/links";
import { fetchSubtitleInfo } from "@/api/youtube";

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

export function useLinkChecks(urls: string[]) {
    return useQueries({
        queries: urls.map((url) => ({
            queryKey: ["link", url],
            queryFn: () => fetchSubtitleInfo(url),
            enabled: Boolean(url),
            refetchOnMount: false,
            refetchOnWindowFocus: false,
            refetchOnReconnect: false,
            staleTime: Infinity,
        })),
    });
}


export function useCreateLink() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createLink,
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

