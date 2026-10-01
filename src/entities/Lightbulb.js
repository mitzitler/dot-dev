import { SCALE, PARALLAX_HEIGHT, DIST_FROM_CENTER_TO_GROUND_HEIGHT  } from "../constants";

export default function makeLightbulb(k, mask, posVec2) {
    // this has k.anchor(), k.area(), k.body(), k.pos(), k.sprite - with default anim
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

    const bulbWidth = lightbulb.width * lightbulbScale;
    const bulbHeight = lightbulb.height * lightbulbScale;
    // ground-height reference in mask-local terms, derived the same way girlie's spawn is
    const groundLocalY = (PARALLAX_HEIGHT * SCALE) / 2 + SCALE * DIST_FROM_CENTER_TO_GROUND_HEIGHT;

    const bulbBottomEdge = lightbulb.pos.y + bulbHeight / 2;
    const gapZ = groundLocalY - bulbBottomEdge;

    lightbulb.use(k.area({
        shape: new k.Rect(
            k.vec2(-bulbWidth / 2, -bulbHeight / 2),
            bulbWidth,
            bulbHeight + gapZ
        ),
    }));

    // lightbulb.user(k.area());

    return lightbulb;


}