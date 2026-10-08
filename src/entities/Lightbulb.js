import { PARALLAX_HEIGHT, DIST_FROM_CENTER_TO_GROUND_HEIGHT  } from "../constants";
import { getScale } from "../helpers/scale.js";

export default function makeLightbulb(k, mask, posVec2) {
    // this has k.anchor(), k.area(), k.body(), k.pos(), k.sprite - with default anim

    const SCALE = getScale();

    let lightbulbScale = SCALE-0.6;

    let lightbulb = mask.add([
        k.sprite("lightbulb", {anim: "off"}),
        // k.scale(lightbulbScale),
        k.scale(SCALE),
        k.anchor("center"),
        // if this uses a shape for area, make sure its relative to itself, not to the canvas
        // k.area(), 
        // k.body(),
        k.pos(posVec2),
        k.z(990),
        "lightbulb",
        // custom vars
        {
            isOn: false, 
            id: "",
        },
    ]);

    // Add the area comp up front (unshaped) so callers can register onCollide
    // synchronously. kaplay reads `area.shape` live every frame, so the real
    // collider can be slotted in later without re-adding the component.
    lightbulb.use(k.area());

    // The collider is sized from the sprite's frame dimensions, but a sprite comp
    // starts at width/height 0 and only gets real values once its (async) asset
    // finishes loading. Computing the shape synchronously captured a zero-size
    // hitbox on a cold load but a full-size one on a warm/cached load or resize
    // rebuild — that's why the bulb sometimes collides with girlie on spawn and
    // sometimes never collides at all. Defer the shape to the sprite's onLoad
    // (which fires immediately if the asset is already loaded) so the dimensions
    // are always real and the hitbox is identical on every build.
    k.getSprite("lightbulb").onLoad(() => {
        const bulbWidth = lightbulb.width * lightbulbScale;
        const bulbHeight = lightbulb.height * lightbulbScale;
        // ground-height reference in mask-local terms, derived the same way girlie's spawn is
        const groundLocalY = (PARALLAX_HEIGHT * SCALE) / 2 + SCALE * DIST_FROM_CENTER_TO_GROUND_HEIGHT;

        const bulbBottomEdge = lightbulb.pos.y + bulbHeight / 2;
        const gapZ = groundLocalY - bulbBottomEdge;

        lightbulb.area.shape = new k.Rect(
            k.vec2(-bulbWidth / 2, -bulbHeight / 2),
            bulbWidth,
            bulbHeight + gapZ
        );
    });

    return lightbulb;


}