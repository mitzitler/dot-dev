import { atom, createStore } from "jotai";

export const isModalVisible = atom(false);
export const chosenModalDataAtom = atom({
    "id": 0,
    "title": "",
    "text": "",
    "linkText": "",
    "link": ""
});

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

// Debug-only: lets the in-game "b"/"n" keys force the unfocus state without
// opening a real React modal, so the whole system can be exercised from the
// keyboard. Not set by any production UI.
export const isDebugUnfocusAtom = atom(false);

// True whenever ANY React modal is open. Kaplay subscribes to this (see Bg.js
// and Lightbulb.js) to hand the screen over to React and dim every pixelated
// layer into MODAL_FOCUS. Add new modal-visibility atoms here as they appear.
export const isAnyModalVisibleAtom = atom((get) =>
    get(isSocialModalVisibleAtom) ||
    get(isEmailModalVisibleAtom) ||
    get(isProjectModalVisibleAtom) ||
    get(isDebugUnfocusAtom) ||
    get(isModalVisible)
);

export const selectedDirectionBtn = atom("");

// is this the best way to do this?
export const isMobile = atom(false);

export const isFlowerBloomed = atom(false);

export const store = createStore();