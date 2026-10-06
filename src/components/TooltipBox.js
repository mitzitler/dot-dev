import { PALETTE, SCALE_WIDE, SCALE_MOBILE, TOOLBOX_WIDTH, LOAD_IN_DURAION } from "../constants";
import { isMobile, store } from "../store";
import centerUpLoad from "../helpers/centerUpLoad";

const delay = (durationMs) => {
        return new Promise(resolve => setTimeout(resolve, durationMs));
    }

let SCALE = SCALE_WIDE;

function makeBoxMask(k, maskType, parent, pos) {

    // The mask holds the box content (added below) so it gets clipped. It's a
    // child of `parent` (e.g. the lightbulb) so `pos` is parent-local and the
    // tooltip rides along as the parent scrolls. The mask carries k.scale(SCALE),
    // so everything added under it must use unscaled, mask-local units.
    const boxMask = parent.add([
        k.pos(pos),
        k.anchor("center"),
        k.scale(SCALE),
        k.rect(TOOLBOX_WIDTH, 0),
        k.mask(maskType),
        k.z(1001),
    ]);

    return boxMask;
}

// parent is the item that triggers it
// posVec2 is the center bottom point of the box
export default async function makeTooltipBox(k, parent, posVec2, data, durationS) {


    await delay(durationS*1000);

    if (store.get(isMobile, true)) {
        SCALE = SCALE_MOBILE;
    }
    else {
        SCALE = SCALE_WIDE;
    }

    // the vec2 it is passed is the center-bottom point of the box.
    // Create the mask FIRST, then build the box inside it so it gets clipped.
    // Everything below is in unscaled, mask-local units (the mask applies SCALE).
    const textChars = data.text.length; // this should be the driver for the height of the box
    const height = store.get(isMobile, true) ? 140 : 90;

    // posVec2 is the desired center-bottom of the box (caller passes the top of
    // the lightbulb). The box sits centered in the mask for the center-out
    // reveal, so push the mask center up by half the box's *visual* height
    // (height is in mask-local units, so visual height is height*SCALE) plus a
    // 5px gap, so the box's bottom edge lands 5px above posVec2.
    const GAP = 5;
    const maskPos = k.vec2(posVec2.x, posVec2.y - GAP - (height * SCALE) / 2);
    const revealMask = makeBoxMask(k, "intersect", parent, maskPos);

    // mask is anchored center, so local (0,0) is its center. Anchor the box
    // there so it lines up with the mask's clip region.
    const box = revealMask.add([
        k.anchor("center"),
        k.pos(0, 0),
        k.rect(TOOLBOX_WIDTH, height),
        k.color(k.Color.fromHex(PALETTE.colorMaroon)),
        k.opacity(1),
    ]);
    // box is anchor-center, so its local top-left is (-width/2, -height/2).
    const titleX = -(box.width / 2) + 5;
    const titleY = -(box.height / 2) + 5;

    // title
    let titleSize = store.get(isMobile, true) ? 8 : 6;
    box.add([
        k.text(data.title, {
            font: "wellbutrin",
            size: titleSize,
        }),
        k.color(k.Color.fromHex(PALETTE.colorBeige)),
        k.pos(titleX, titleY),
        k.opacity(1),
    ]);

    // text
    let texttSize = store.get(isMobile, true) ? 6 : 4;
    let titleOffset = store.get(isMobile, true) ? 15 : 10;
    box.add([
        k.text(data.text, {
            font: "wellbutrin",
            size: texttSize,
            width: TOOLBOX_WIDTH - 10,
            lineSpacing: 4,
        }),
        k.color(k.Color.fromHex(PALETTE.colorBeige)),
        k.pos(titleX, titleY + titleOffset),
        k.opacity(1),
    ]);

    await centerUpLoad(k, revealMask, height, LOAD_IN_DURAION, true);

    return box;
}
