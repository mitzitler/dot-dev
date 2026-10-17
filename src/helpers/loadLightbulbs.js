import { PARALLAX_HEIGHT, PARALLAX_WIDTH, SCALE_REFERENCE } from "../constants";
import { getScale } from "./scale.js";
import makeLightbulb from "../entities/Lightbulb";
import { attachToScroll, GROUND_SPEED } from "../entities/Bg";

export async function loadLightbulbs(k, mask) {
    const lightbulbData = await( await fetch('./configs/lightbulbData.json')).json();
    const SCALE = getScale();
    const offsetScale = SCALE / SCALE_REFERENCE;
    const lbY = ((PARALLAX_HEIGHT * SCALE) / 2) + 75 * offsetScale;

    for (const lb of lightbulbData) {
        let lb_ = makeLightbulb(
            k,
            mask,
            k.vec2(
                ((PARALLAX_WIDTH * SCALE) / 2) + lb.x_offset * offsetScale, lbY
            ),
            lb.data
        )
        lb_.id = lb.id;
        attachToScroll(lb_, GROUND_SPEED);
    }

}