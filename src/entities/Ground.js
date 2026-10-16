import { PARALLAX_WIDTH, DIST_FROM_CENTER_TO_GROUND_HEIGHT } from "../constants";
import { getScale } from "../helpers/scale.js";

export function makeGround(k) {

    let SCALE = getScale();
    const MARGIN = 100;
    const groundY = k.center().y + SCALE * DIST_FROM_CENTER_TO_GROUND_HEIGHT;
    const worldHalf = PARALLAX_WIDTH * SCALE * MARGIN;
    // k.vec2(k.center().add(0, (SCALE * DIST_FROM_CENTER_TO_GROUND_HEIGHT)))
    k.add([
        k.pos(0, k.center().y + (SCALE * DIST_FROM_CENTER_TO_GROUND_HEIGHT)),
        k.anchor("topleft"),
        k.area({ shape: new k.Rect(k.vec2(0), worldHalf * 2, 10 * SCALE) }),
        k.body({ isStatic: true }),
        "ground"
    ])

}