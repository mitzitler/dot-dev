import { PARALLAX_WIDTH, SCALE_REFERENCE } from "../constants.js";
import { getScale } from "../helpers/scale.js";
import { store, isAnyModalVisibleAtom } from "../store";

export const GROUND_SPEED = -16;
let layers = null;
let scrollingItems = [];

// Each background sprite ships two frames: 0 is the normal look, 1 is the
// desaturated/blurred "a modal is open" look. Swapping every panel's frame is
// how Kaplay visually hands the screen over to a React modal.
export const SCREEN_FOCUS = 0;
export const MODAL_FOCUS = 1;

// Module-level handle to the current scene's mask + its store subscription, so
// focus can be toggled from anywhere (including React, via the store) without
// threading `mask` through every caller. Both are reset on each rebuild.
let bgMask = null;
let unsubFocus = null;

export function makeLayers(k, mask) {
    const SCALE = getScale();
    // Every panel is tagged "bg" so setBgFocus() can find them all — and only
    // them — regardless of which parallax layer they belong to.
    const panel = (name, x) =>
        mask.add([
            k.sprite(name, { frame: SCREEN_FOCUS }),
            k.pos(x, 0),
            k.scale(SCALE),
            "bg",
        ]);
    // Three side-by-side copies per layer so scroll() can recycle them endlessly.
    const triple = (name) => [
        panel(name, PARALLAX_WIDTH * SCALE * -1),
        panel(name, 0),
        panel(name, PARALLAX_WIDTH * SCALE),
    ];
    return [
        { speed: -1,           parts: triple("bg-clouds-back") },
        { speed: -2,           parts: triple("bg-clouds-front") },
        { speed: -3,           parts: triple("bg-mountains") },
        { speed: -4,           parts: triple("bg-hills") },
        { speed: -6,           parts: triple("bg-trees-back") },
        { speed: -8,           parts: triple("bg-trees-front") },
        { speed: GROUND_SPEED, parts: triple("bg-ground") },
    ];
}

// Swap every background panel between its normal (0) and modal-dimmed (1) frame.
// Tag-scoped to "bg" so the girlie and other animated sprites are left alone.
// Safe to call before the scene exists (no-ops until a mask is registered).
export function setBgFocus(focus) {
    if (!bgMask) return;
    for (const panel of bgMask.get("bg")) {
        panel.frame = focus;
    }
}

export default function makeBackground(k, mask) {

    const SCALE = getScale();

    // Reset scroll registrations on every (re)build: the scene is rebuilt from
    // scratch on resize, so without this attachToScroll() would keep appending
    // entries that point at destroyed objects from the previous build.
    scrollingItems = [];

    bgMask = mask;

    mask.add([
        k.sprite("bg-sky", { frame: SCREEN_FOCUS }),
        k.scale(SCALE),
        k.pos(0, 0),
        "bg",
    ]);

    layers = makeLayers(k, mask);

    // Drive focus from React: whenever a modal opens or closes, flip every "bg"
    // panel into MODAL_FOCUS / SCREEN_FOCUS. The scene is rebuilt on resize, so
    // tear down the previous subscription first — otherwise stale listeners
    // pointing at destroyed masks would stack up. Sync once immediately in case
    // a modal is already open at rebuild time.
    if (unsubFocus) unsubFocus();
    const syncFocus = () =>
        setBgFocus(store.get(isAnyModalVisibleAtom) ? MODAL_FOCUS : SCREEN_FOCUS);
    unsubFocus = store.sub(isAnyModalVisibleAtom, syncFocus);
    syncFocus();

};

export function attachToScroll(gameObj, speed = GROUND_SPEED) {
    scrollingItems.push({ obj: gameObj, speed });
}

export function scroll(k, direction, walk = true) {

    const SCALE = getScale();
    const tileWidth = PARALLAX_WIDTH * SCALE;
    let speedModifier = 5
    if (!walk) speedModifier = 20;
    // Normalize world speed across zoom levels: a bigger SCALE means a bigger
    // world, so without this a fixed pixel velocity feels fast when zoomed out
    // (small SCALE) and slow when zoomed in. Dividing by SCALE_REFERENCE keeps
    // the desktop feel identical while fixing the "too fast on mobile" case.
    speedModifier *= SCALE / SCALE_REFERENCE;

    for (const layer of layers) {
        const last = layer.parts.length - 1;
        let velocity = direction === "right" ? layer.speed : -layer.speed;
        velocity *= speedModifier;

        if (direction === "right" && layer.parts[0].pos.x < -2 * tileWidth) {
            // leftmost panel has fully scrolled out of view; recycle it to become the new rightmost
            const rightmostX = layer.parts[last].pos.x;
            layer.parts[0].moveTo(rightmostX + tileWidth, layer.parts[0].pos.y);
            layer.parts.push(layer.parts.shift());
        }
        else if (direction === "left" && layer.parts[last].pos.x > 2 * tileWidth) {
            // rightmost panel has fully scrolled out of view; recycle it to become the new leftmost
            const leftmostX = layer.parts[0].pos.x;
            layer.parts[last].moveTo(leftmostX - tileWidth, layer.parts[last].pos.y);
            layer.parts.unshift(layer.parts.pop());
        }

        for (const part of layer.parts) {
            part.move(velocity, 0);
        }
    }

    for (const item of scrollingItems) {
        let velocity = direction === "right" ? item.speed : -item.speed;
        velocity *= speedModifier;
        item.obj.move(velocity, 0);
    }
}