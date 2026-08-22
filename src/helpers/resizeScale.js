import { PARALLAX_WIDTH, PARALLAX_HEIGHT } from "../constants";

export default function resizeScale(k) {
    h = k.height();
    w = k.width();
    let scale = (w - 20) / PARALLAX_WIDTH;
    if (h > w) { // if the height is greater than width...
        // update PARALLAX_WIDTH
    }
    return scale;

}