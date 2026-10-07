import { getScale } from "../helpers/scale.js";

// this is added to the bg scroll in the same way that lightbulb is
export default function makeFlower(k, mask, posVec2) {

    const SCALE = getScale();

    const flower = mask.add([
        k.sprite("flower", {anim: "rest"}),
        k.scale(SCALE*1.8),
        k.anchor("center"),
        k.pos(posVec2),
        "flower",
        k.area(),
        k.z(999),
        {
            isBloomed: false,
        }

        // custom vars

    ]);



    // if isFlowerBloomed.get(true), then do the secondary animation 
    // component: ContactsBar


    return flower;



}