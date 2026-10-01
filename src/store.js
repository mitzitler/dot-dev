import { atom, createStore } from "jotai";

export const isSocialModalVisibleAtom = atom(false);
export const selectedLinkAtom = atom(null);
export const selectedLinkDescriptionAtom = atom("");

export const isEmailModalVisibleAtom = atom(false);
export const emailAtom = atom("");

export const isProjectModalVisibleAtom = atom(false);
export const chosenProjectDataAtom = atom({
    title: "",
    links: [{ id: 0, name: "", link: "" }],
});

export const selectedDirectionBtn = atom("");

// is this the best way to do this?
export const isMobile = atom(false);

export const isFlowerBloomed = atom(false);

export const store = createStore();