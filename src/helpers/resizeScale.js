import {
    PARALLAX_WIDTH,
    PARALLAX_HEIGHT,
    SCALE_MAX,
    CHROME_V,
    MOBILE_BREAKPOINT,
    MOBILE_VISIBLE_FRACTION,
} from "../constants";

// Viewport-derived scale.
//
// Desktop (wide): "contain" — fit the WHOLE world width into the viewport.
// Mobile (narrow, width < MOBILE_BREAKPOINT): ZOOM IN — make only the middle
//   MOBILE_VISIBLE_FRACTION of the world width span the viewport, so a phone
//   shows a cropped, legible slice instead of the entire 840-wide scene shrunk
//   to nothing. (This restores the intent of the old SCALE_WIDE/SCALE_MOBILE.)
//
// Either way we also fit the height (parallax + chrome), so Math.min guards
// against vertical overflow; on a tall phone the width term wins and we zoom.
export default function resizeScale(k) {
    const w = k.width();
    const h = k.height();

    const isMobile = w < MOBILE_BREAKPOINT;
    const targetVisibleWidth = isMobile
        ? PARALLAX_WIDTH * MOBILE_VISIBLE_FRACTION
        : PARALLAX_WIDTH;

    const scaleForWidth = w / targetVisibleWidth;
    const scaleForHeight = h / (PARALLAX_HEIGHT + CHROME_V); // CHROME_V in unscaled units

    const scale = Math.min(scaleForWidth, scaleForHeight) * 0.95; // breathing room at the edges
    return Math.min(SCALE_MAX, scale);
}
