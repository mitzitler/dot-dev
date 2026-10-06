/*
    Load sequence: nametag loads in center-out, holds, loads back out from
    the inside-out, then the 50/50 shader reveals the scene underneath.

    Load-in uses a mask("intersect") entity (same pattern as the parallax
    background clip in Bg.js): its rect is the *visible* window, growing
    outward from 0 to full height.

    Load-out uses a mask("subtract") entity instead: its rect is a *hole*
    punched out of the sprite, growing outward from 0 to full height, so
    the center disappears first and the hidden region expands outward -
    the opposite direction of the intersect reveal.

    Either way the sprite itself is always drawn at its real, correct
    scale - only the mask's height (a real clip window, not a UV/quad
    remap) grows or shrinks.
*/
import { SCALE_WIDE, SCALE_MOBILE, LOAD_IN_DURAION } from "../constants.js";
import { isMobile, store } from "../store.js";
import centerUpLoad from "./centerUpLoad.js";

// native pixel dimensions of public/sprites/nametag.png
const NAMETAG_WIDTH = 373; // small = 128
const NAMETAG_HEIGHT = 187; // small = 64

const PRE_PAUSE_SECONDS = 0.5;
const NAMETAG_IN_DURATION = 0.7;
const HOLD_SECONDS = 0.5;
// nametag load-out and the shader reveal run off a single tween so their clip
// edges stay locked together on screen (see the outro block below)
const SHADER_OUTRO_DURATION = 1.0;
let SCALE = SCALE_WIDE;
if (store.get(isMobile, true)) {
        SCALE = SCALE_MOBILE;
    }
    else {
        SCALE = SCALE_WIDE;
    }


function makeNametagMask(k, maskType) {

    const nametagMask = k.add([
        k.pos(k.center()),
        k.anchor("center"),
        k.scale(SCALE),
        k.rect(NAMETAG_WIDTH, 0),
        k.mask(maskType),
        // z sorts siblings under the same parent - shaderEntity is a
        // root-level sibling of this mask, so this z (not the child
        // sprite's) is what needs to be above the curtain (z: 1000).
        k.z(1001),
    ]);

    nametagMask.add([
        k.sprite("nametag_large"),
        k.anchor("center"),
    ]);

    return nametagMask;
}

export default async function startLoadSequence(k, shaderEntity, shaderProgress) {
    await k.wait(PRE_PAUSE_SECONDS);

    const revealMask = makeNametagMask(k, "intersect");
    await centerUpLoad(k, revealMask, NAMETAG_HEIGHT, LOAD_IN_DURAION, true);
    await k.wait(HOLD_SECONDS);
    revealMask.destroy();

    const hideMask = makeNametagMask(k, "subtract");
    // Drive the nametag's subtract hole and the shader's reveal window from a
    // single value so their clip edges share the exact same screen height and
    // Y position at every frame. The camera is at 1x, so the mask's screen
    // half-height is (hideMask.height * SCALE) / 2, and the shader's revealed
    // window half-height is v * 0.5 * screenHeight; setting the two equal gives
    // hideMask.height = v * screenHeight / SCALE. The nametag is tiny relative
    // to the screen, so its hole swallows it long before the full-screen
    // curtain finishes - identical edges, different apparent speed.
    const screenHeight = k.height();
    await k.tween(0, 1, SHADER_OUTRO_DURATION, (v) => {
        shaderProgress.value = v;
        hideMask.height = (v * screenHeight) / SCALE;
    }, k.easings.linear);
    hideMask.destroy();
    shaderEntity.destroy();
}
