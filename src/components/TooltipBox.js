import {
    PALETTE,
    LOAD_IN_DURAION,
    TOOLTIP_WIDTH_PX,
    TOOLTIP_HEIGHT_PX,
    TOOLTIP_TITLE_PX,
    TOOLTIP_BODY_PX,
    TOOLTIP_PAD_PX,
    TOOLTIP_TITLE_GAP_PX,
    TOOLTIP_LINE_PX,
} from "../constants";
import { getScale } from "../helpers/scale.js";
import centerUpLoad from "../helpers/centerUpLoad";

const delay = (durationMs) => {
        return new Promise(resolve => setTimeout(resolve, durationMs));
    }

// The tooltip's mask is a child of the lightbulb (which already carries
// k.scale(SCALE)) AND the mask applies SCALE again, so box CONTENT renders at
// SCALE². Dividing a target screen px by SCALE² lands it at exactly that many
// screen px on every device, independent of zoom.
const content = (screenPx, scale) => screenPx / (scale * scale);
// The mask's POSITION, by contrast, lives one level up in lightbulb-local space
// (a single SCALE to screen), so positional offsets divide by SCALE only.
const local = (screenPx, scale) => screenPx / scale;

function makeBoxMask(k, maskType, parent, pos, boxW) {

    const SCALE = getScale();

    // The mask holds the box content (added below) so it gets clipped. It's a
    // child of `parent` (e.g. the lightbulb) so `pos` is parent-local and the
    // tooltip rides along as the parent scrolls. The mask carries k.scale(SCALE),
    // so everything added under it must use unscaled, mask-local units.
    const boxMask = parent.add([
        k.pos(pos),
        k.anchor("center"),
        k.scale(SCALE),
        k.rect(boxW, 0),
        k.mask(maskType),
        k.z(1001),
    ]);

    return boxMask;
}

// parent is the item that triggers it
// posVec2 is the center bottom point of the box
export default async function makeTooltipBox(k, parent, posVec2, data, durationS) {


    await delay(durationS*1000);

    const SCALE = getScale();

    // Content dims use content() (÷SCALE²) so they render at the target screen px
    // regardless of zoom. The box is WIDE (wider than tall), so longer copy wraps
    // onto a few lines within the width rather than making the box grow downward.
    const width = content(TOOLTIP_WIDTH_PX, SCALE);
    const height = content(TOOLTIP_HEIGHT_PX, SCALE)+5;
    const pad = content(TOOLTIP_PAD_PX, SCALE);

    // posVec2 is the desired center-bottom of the box (caller passes the top of
    // the lightbulb). Push the mask center up by half the box's *visual* height
    // plus a small gap so the box's bottom edge lands just above posVec2. This
    // offset is in lightbulb-local space (one SCALE): (height × SCALE)/2 works
    // because height is ÷SCALE², so height×SCALE = (visual height)/SCALE.
    const GAP = local(6, SCALE);
    const maskPos = k.vec2(posVec2.x, posVec2.y - GAP - (height * SCALE) / 2);
    const revealMask = makeBoxMask(k, "intersect", parent, maskPos, width);

    // mask is anchored center, so local (0,0) is its center. Anchor the box
    // there so it lines up with the mask's clip region.
    const box = revealMask.add([
        k.anchor("center"),
        k.pos(0, 0),
        k.rect(width, height),
        k.color(k.Color.fromHex(PALETTE.colorBeige)),
        k.outline(2, k.Color.fromHex(PALETTE.colorMaroon)),
        k.opacity(1),
    ]);
    // box is anchor-center, so its local top-left is (-width/2, -height/2).
    const titleX = -(box.width / 2) + pad;
    const titleY = -(box.height / 2) + pad;

    // title
    box.add([
        k.text(data.title, {
            font: "wellbutrin",
            size: content(TOOLTIP_TITLE_PX, SCALE),
        }),
        k.color(k.Color.fromHex(PALETTE.colorMaroon)),
        k.pos(titleX, titleY),
        k.opacity(1),
    ]);

    // text — wraps within the box width (minus padding on both sides)
    box.add([
        k.text(data.text, {
            font: "wellbutrin",
            size: content(TOOLTIP_BODY_PX, SCALE),
            width: width - pad * 2,
            lineSpacing: content(TOOLTIP_LINE_PX, SCALE),
        }),
        k.color(k.Color.fromHex(PALETTE.colorMaroon)),
        k.pos(titleX, titleY + content(TOOLTIP_TITLE_GAP_PX, SCALE)),
        k.opacity(1),
    ]);

    await centerUpLoad(k, revealMask, height, LOAD_IN_DURAION, true);

    return box;
}
