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
import centerUpScale from "../helpers/centerUpScale";

const delay = (durationMs) => {
        return new Promise(resolve => setTimeout(resolve, durationMs));
    }

// ms per character for the typewriter reveal.
const TYPE_CHAR_MS = 30;

// Reveals a kaplay text object one character at a time by growing its string.
// The glyphs are always drawn at their true size — no scaling, no opacity — so
// the text keeps full pixel integrity while the box animates around it.
const typewrite = async (textObj, full) => {
    for (let i = 1; i <= full.length; i++) {
        textObj.text = full.slice(0, i);
        await delay(TYPE_CHAR_MS);
    }
    textObj.text = full;
};

// The box is a child of the lightbulb (which already carries k.scale(SCALE)) AND
// the box applies SCALE again, so box CONTENT renders at SCALE². Dividing a
// target screen px by SCALE² lands it at exactly that many screen px on every
// device, independent of zoom.
const content = (screenPx, scale) => screenPx / (scale * scale);
// The box's POSITION, by contrast, lives one level up in lightbulb-local space
// (a single SCALE to screen), so positional offsets divide by SCALE only.
const local = (screenPx, scale) => screenPx / scale;

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
    // the lightbulb). Push the box center up by half the box's *visual* height
    // plus a small gap so the box's bottom edge lands just above posVec2. This
    // offset is in lightbulb-local space (one SCALE): (height × SCALE)/2 works
    // because height is ÷SCALE², so height×SCALE = (visual height)/SCALE.
    const GAP = local(6, SCALE);
    const boxPos = k.vec2(posVec2.x, posVec2.y - GAP - (height * SCALE) / 2);

    // The box is a direct child of the lightbulb (no nested mask), so it clips
    // cleanly to the scene mask and rides along as the lightbulb scrolls. It
    // carries k.scale(SCALE) — the same scale the old reveal mask applied — so
    // all content() / local() math is unchanged. It starts collapsed (scale.y 0)
    // and is grown open by centerUpScale below; no opacity is ever touched.
    const box = parent.add([
        k.pos(boxPos),
        k.anchor("center"),
        k.scale(k.vec2(SCALE, 0)),
        k.rect(width, height),
        k.color(k.Color.fromHex(PALETTE.colorBeige)),
        k.z(1001),
    ]);
    // box is anchor-center, so its local top-left is (-width/2, -height/2).
    const titleX = -(box.width / 2) + pad;
    const titleY = -(box.height / 2) + pad;

    // 1) Squash the borderless, empty box open to full size from its center.
    //    Only the plain fill scales — no outline, no text — so nothing that
    //    needs crisp pixels is ever distorted.
    await centerUpScale(k, box, SCALE, LOAD_IN_DURAION, true);

    // 2) Add the border now that the box is at full size, so the outline is
    //    only ever drawn at its true 1px weight.
    box.use(k.outline(1, k.Color.fromHex(PALETTE.colorMaroon)));

    // 3) Add the text at full size (empty), then type it in character by
    //    character. Text is only ever rendered at its true scale, and nothing
    //    touches opacity — pixel + palette integrity preserved.
    const title = box.add([
        k.text("", {
            font: "wellbutrin",
            size: content(TOOLTIP_TITLE_PX, SCALE),
        }),
        k.color(k.Color.fromHex(PALETTE.colorMaroon)),
        k.pos(titleX, titleY),
    ]);

    // body — wraps within the box width (minus padding on both sides)
    const body = box.add([
        k.text("", {
            font: "wellbutrin",
            size: content(TOOLTIP_BODY_PX, SCALE),
            width: width - pad * 2,
            lineSpacing: content(TOOLTIP_LINE_PX, SCALE),
        }),
        k.color(k.Color.fromHex(PALETTE.colorMaroon)),
        k.pos(titleX, titleY + content(TOOLTIP_TITLE_GAP_PX, SCALE)),
    ]);

    await typewrite(title, data.title);
    await typewrite(body, data.text);

    return box;
}
