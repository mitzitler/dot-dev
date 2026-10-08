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

    // Width (in sprite-frame px) of the trigger column. The visible bulb art is
    // ~28px wide inside the 40px frame; keep the hitbox to the art, not the frame.
    const TRIGGER_W = 30;

    // Add the area comp up front (unshaped) so callers can register onCollide
    // synchronously. kaplay reads `area.shape` live every frame, so the real
    // collider can be slotted in later without re-adding the component.
    lightbulb.use(k.area());

    // The collider depends on the sprite's loaded position/scale context. A sprite
    // comp also starts at width/height 0 until its (async) asset loads, so building
    // the shape synchronously produced a zero-size hitbox on a cold load but a
    // full-size one on a warm/cached load or resize rebuild — that's why the bulb
    // sometimes collided with girlie on spawn and sometimes never did. Defer to the
    // sprite's onLoad (fires immediately if already loaded) so it's identical on
    // every build.
    k.getSprite("lightbulb").onLoad(() => {
        // Ground line in mask-local space (same derivation as girlie's spawn). The
        // bulb floats above it, so the trigger extends DOWN to the ground to catch
        // girlie (who stands on it) when she's horizontally aligned with the bulb.
        const groundLocalY = (PARALLAX_HEIGHT * SCALE) / 2 + SCALE * DIST_FROM_CENTER_TO_GROUND_HEIGHT;
        // The shape is in frame-local px and gets multiplied by the bulb's own
        // k.scale(SCALE), so convert the world drop-to-ground back into frame px.
        const columnH = (groundLocalY - lightbulb.pos.y) / SCALE;

        // kaplay auto-applies a (-w/2, -h/2) shift for a center anchor, so a Rect
        // pos of (0, H/2) lands the column centered horizontally on the bulb with
        // its TOP at the bulb's center, growing straight down to the ground.
        lightbulb.area.shape = new k.Rect(
            k.vec2(0, columnH / 2),
            TRIGGER_W,
            columnH
        );
    });

    return lightbulb;


}