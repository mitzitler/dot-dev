import { PARALLAX_WIDTH, PARALLAX_HEIGHT, SCALE_MAX, CHROME_V } from "../constants";

// Viewport-fit ("contain") scale: pick the largest scale at which the parallax
// window PLUS the vertical chrome (contacts above, controls below) still fits
// both the width and the height of the canvas. Math.min across the two ratios
// is what handles portrait vs landscape — whichever dimension is tighter wins.
// Capped by SCALE_MAX (no floor, on purpose — see constants.js).
export default function resizeScale(k) {
    const w = k.width();
    const h = k.height();
    const scaleForWidth = w / PARALLAX_WIDTH;
    const scaleForHeight = h / (PARALLAX_HEIGHT + CHROME_V); // CHROME_V in unscaled units
    const scale = Math.min(scaleForWidth, scaleForHeight) * 0.95; // breathing room at the edges
    return Math.min(SCALE_MAX, scale);
}
