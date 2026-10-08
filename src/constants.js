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

export const DIST_FROM_CENTER_TO_GROUND_HEIGHT = 100;
export const LOAD_IN_DURAION = 0.7;
