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
export const SCALE_WIDE = 2.08; // 2.6 * 0.8, baking in the old desktop camera zoom now that camera scaling is gone
export const SCALE_MOBILE = SCALE_WIDE*0.75;
export const DIST_FROM_CENTER_TO_GROUND_HEIGHT = 100;
