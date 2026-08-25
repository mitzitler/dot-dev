import { PALETTE, SCALE, TOOLBOX_WIDTH } from "../constants";

// parent is the item that triggers it
// posVec2 is the center bottom point of the box
export default function makeTooltipBox(k, parent, posVec2, data) {
    // on colide, this function will fire...
    // the vec2 it is passed is the top centermost of 
    const centerPosX = posVec2.x - (TOOLBOX_WIDTH*SCALE/2);
    const textChars = data.text.length; // this should be the driver for the height of the box
    const height = 110; 
    const box = parent.add([
        k.anchor("botleft"),
        k.pos(centerPosX, posVec2.y - 20),
        k.rect(TOOLBOX_WIDTH*SCALE, height),
        k.color(k.Color.fromHex(PALETTE.colorMaroon)),
        k.opacity(1)
    ])
    const titleX = box.pos.x + (box.width/2) + 5; // this is a bad positioning
    const titleY = box.pos.y - (box.height/2);

    const boxTitle = box.add([
        k.text(data.title, {
            font: "wellbutrin",
            size: 14,
        }),
        k.color(k.Color.fromHex(PALETTE.colorBeige)),
        k.pos(titleX, titleY),
        k.opacity(1),
    ]);

    const boxText = box.add([
        k.text(data.text, {
            font: "wellbutrin",
            size: 9,
            width: TOOLBOX_WIDTH*SCALE-10,
            lineSpacing: 4,
        }),
        k.color(k.Color.fromHex(PALETTE.colorBeige)),
        k.pos(titleX, titleY+20),
        k.opacity(1),
    ])

    return box;
}
