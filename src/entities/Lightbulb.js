import { SCALE } from "../constants";

export default function makeLightbulb(k, mask, posVec2) {
    // this has k.anchor(), k.area(), k.body(), k.pos(), k.sprite - with default anim
    let lightbulb = mask.add([
        k.sprite("lightbulb", {anim: "off"}),
        k.scale(SCALE-0.6),
        k.anchor("center"),
        k.area(), 
        k.body(),
        k.pos(posVec2),
        k.z(990),
        "lightbulb",
        // custom vars
        {
            isOn: false, 
            id: "",
        },
    ]);

    return lightbulb;

}