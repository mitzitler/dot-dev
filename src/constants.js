// This is the Woodspark Palette by Anubi
// https://lospec.com/palette-list/woodspark
export const PALETTE = {
    colorBeige: "#f5eeb0",
    colorYellow: "#fabf61",
    colorOrange: "#e08d51",
    colorBrownLight: "#8a5865",
    colorBrownDark: "#452b3f",
    colorGreenLight: "#c6cc54",
    colorGreenMid: "#609c4f",
    colorGreenDark: "#2c5e3b",
    colorBlueLight: "#78c2d6",
    colorBlueDark: "#5479b0",
    colorGrayLight: "#e0d3c8",
    colorGrayMid: "#839fa6",
    colorGrayDark: "#56546e",
    colorRed: "#f05b5b",
    colorMaroon: "#8f325f",
    colorPink: "#eb6c98",
};

export const DIAGONAL_FACTOR = 1 / Math.sqrt(2);

export const PARALLAX_WIDTH = 840; // or smaller? is that possible?
export const PARALLAX_HEIGHT = 384;
export const TOOLBOX_WIDTH = 80;
export const CONTROLBAR_WIDTH = 250;
export const CONTROLBAR_HEIGHT = 100;

// Scale is now derived from the viewport (see helpers/resizeScale.js), not a
// fixed device-class constant. SCALE_MAX caps it so the pixel art doesn't get
// blurry on huge monitors; there is deliberately no SCALE_MIN (a floor would
// re-introduce overflow on small screens, which is the thing we're fixing).
// 2.08 was the old desktop scale (2.6 * 0.8); the cap sits a little above it.
export const SCALE_MAX = 2.4;
// Unscaled vertical room reserved above+below the parallax window for the
// contacts bar (above) and the touch controls (below), so neither clips when
// the scene is height-bound. Roughly: contacts offset + headroom + controls
// offset (30) + controls height (80).
export const CHROME_V = 170;
// Unscaled vertical offset of the contacts bar above the parallax window.
export const CONTACTS_Y_OFFSET = 30;

// --- mobile zoom ---------------------------------------------------------
// Below this viewport width we treat the screen as "mobile/narrow" and ZOOM IN
// instead of fitting the whole world, so phones show a cropped, legible slice
// rather than the entire 840-wide scene shrunk to nothing.
export const MOBILE_BREAKPOINT = 768;
// On mobile, how much of the world's WIDTH should be visible across the
// viewport (0.40 = show the middle 40%, i.e. ~2.5× zoom vs "fit whole width").
// Tunable knob — nudge after seeing it on a real device.
export const MOBILE_VISIBLE_FRACTION = 0.40;

// The old desktop scale. Used as the "correct feel" baseline: values that were
// hand-tuned at this scale (scroll speed, the lightbulb's pixel offsets) are
// multiplied by SCALE / SCALE_REFERENCE so they stay proportional at any zoom
// while looking identical to the original on a wide screen.
export const SCALE_REFERENCE = 2.08;

// --- tooltip (screen-px targets) -----------------------------------------
// The tooltip's mask is a child of the lightbulb, which ALREADY carries
// k.scale(SCALE), and the mask applies SCALE again — so content renders at
// SCALE². TooltipBox divides these targets by SCALE² so they land at the exact
// screen px below on every device. The box is WIDE (wider than tall), so longer
// copy stays on a few lines and fits the height instead of growing downward.
export const TOOLTIP_WIDTH_PX = 360;
export const TOOLTIP_HEIGHT_PX = 150;
export const TOOLTIP_TITLE_PX = 18; // heading
export const TOOLTIP_BODY_PX = 14;  // body — reads well for the pixel font at this size
export const TOOLTIP_PAD_PX = 14;   // inner padding from the box edge
export const TOOLTIP_TITLE_GAP_PX = 24; // top of title → top of body
export const TOOLTIP_LINE_PX = 4;   // extra line spacing for the body copy

export const DIST_FROM_CENTER_TO_GROUND_HEIGHT = 100;
export const LOAD_IN_DURAION = 0.7;
