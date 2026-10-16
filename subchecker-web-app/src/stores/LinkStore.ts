import { Store } from '@tanstack/react-store';

export const linkStore = new Store({
    links: [
        "https://www.youtube.com/watch?v=wfaL-baiNUo",
        "https://www.youtube.com/watch?v=UXhV9FxxGbg",
        "https://www.youtube.com/watch?v=cpQKZPMhprI",
        "https://www.youtube.com/watch?v=ql2sBRmgUU8",
        "https://www.youtube.com/watch?v=VRoTdrJn2xw",
    ]
});

export const addLink = (newLink: string) => {
    if (!newLink.trim()) return;

    linkStore.setState((state) => ({
        ...state,
        links: [...state.links, newLink]
    }));
};

export const removeLink = (indexToRemove: number) => {
    linkStore.setState((state) => ({
        ...state,
        links: state.links.filter((_, index) => index !== indexToRemove)
    }));
};
