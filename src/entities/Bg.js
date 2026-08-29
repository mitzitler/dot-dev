import { PARALLAX_HEIGHT, PARALLAX_WIDTH, SCALE} from "../constants.js";
export const GROUND_SPEED = -16;
let layers = null;
let scrollingItems = [];

export function makeLayers(k, mask) {
        return [
        { // clouds-back
            speed: -1,
            parts: [
                mask.add([k.sprite("bg-clouds-back"), k.pos(PARALLAX_WIDTH * SCALE * -1, 0), k.scale(SCALE)]),
                mask.add([k.sprite("bg-clouds-back"), k.pos(0, 0), k.scale(SCALE)]),
                mask.add([k.sprite("bg-clouds-back"), k.pos(PARALLAX_WIDTH * SCALE, 0), k.scale(SCALE)]),
            ],
        },
        { // clouds-front
            speed: -2,
            parts: [
                mask.add([k.sprite("bg-clouds-front"), k.pos(PARALLAX_WIDTH * SCALE * -1, 0), k.scale(SCALE)]),
                mask.add([k.sprite("bg-clouds-front"), k.pos(0, 0), k.scale(SCALE)]),
                mask.add([k.sprite("bg-clouds-front"), k.pos(PARALLAX_WIDTH * SCALE, 0), k.scale(SCALE)]),
            ],
        },
        { // mountains
            speed: -3,
            parts: [
                mask.add([k.sprite("bg-mountains"), k.pos(PARALLAX_WIDTH * SCALE * -1, 0), k.scale(SCALE)]),
                mask.add([k.sprite("bg-mountains"), k.pos(0, 0), k.scale(SCALE)]),
                mask.add([k.sprite("bg-mountains"), k.pos(PARALLAX_WIDTH * SCALE, 0), k.scale(SCALE)]),
            ],
        },
        { // hills
            speed: -4,
            parts: [
                mask.add([k.sprite("bg-hills"), k.pos(PARALLAX_WIDTH * SCALE * -1, 0), k.scale(SCALE)]),
                mask.add([k.sprite("bg-hills"), k.pos(0, 0), k.scale(SCALE)]),
                mask.add([k.sprite("bg-hills"), k.pos(PARALLAX_WIDTH * SCALE, 0), k.scale(SCALE)]),
            ],
        },
        { // trees-back
            speed: -6,
            parts: [
                mask.add([k.sprite("bg-trees-back"), k.pos(PARALLAX_WIDTH * SCALE * -1, 0), k.scale(SCALE)]),
                mask.add([k.sprite("bg-trees-back"), k.pos(0, 0), k.scale(SCALE)]),
                mask.add([k.sprite("bg-trees-back"), k.pos(PARALLAX_WIDTH * SCALE, 0), k.scale(SCALE)]),
            ],
        },
        { // trees-front
            speed: -8,
            parts: [
                mask.add([k.sprite("bg-trees-front"), k.pos(PARALLAX_WIDTH * SCALE * -1, 0), k.scale(SCALE)]),
                mask.add([k.sprite("bg-trees-front"), k.pos(0, 0), k.scale(SCALE)]),
                mask.add([k.sprite("bg-trees-front"), k.pos(PARALLAX_WIDTH * SCALE, 0), k.scale(SCALE)]),
            ],
        },
        { // ground
            speed: GROUND_SPEED,
            parts: [
                mask.add([k.sprite("bg-ground"), k.pos(PARALLAX_WIDTH * SCALE * -1, 0), k.scale(SCALE)]),
                mask.add([k.sprite("bg-ground"), k.pos(0, 0), k.scale(SCALE)]),
                mask.add([k.sprite("bg-ground"), k.pos(PARALLAX_WIDTH * SCALE, 0), k.scale(SCALE)]),
            ],
        },
    ]
}

export default function makeBackground(k, mask) {

    mask.add([
        k.sprite("bg-sky"), 
        k.scale(SCALE),
        k.pos(0, 0)
    ]);

    layers = makeLayers(k, mask);

    // k.add([
    //     k.sprite("bg-frame"), 
    //     k.scale(SCALE),
    //     k.pos(mask.pos.x, mask.pos.y) // 0,0 is the top left corner FWIW
    // ]);
};

export function attachToScroll(gameObj, speed = GROUND_SPEED) {
    scrollingItems.push({ obj: gameObj, speed });
}

export function scroll(k, direction, walk = true) {

    const tileWidth = PARALLAX_WIDTH * SCALE;
    let speedModifier = 5
    if (!walk) speedModifier = 20;

    for (const layer of layers) {
        const last = layer.parts.length - 1;
        let velocity = direction === "right" ? layer.speed : -layer.speed;
        velocity *= speedModifier;

        if (direction === "right" && layer.parts[0].pos.x < -2 * tileWidth) {
            // leftmost panel has fully scrolled out of view; recycle it to become the new rightmost
            const rightmostX = layer.parts[last].pos.x;
            layer.parts[0].moveTo(rightmostX + tileWidth, layer.parts[0].pos.y);
            layer.parts.push(layer.parts.shift());
        }
        else if (direction === "left" && layer.parts[last].pos.x > 2 * tileWidth) {
            // rightmost panel has fully scrolled out of view; recycle it to become the new leftmost
            const leftmostX = layer.parts[0].pos.x;
            layer.parts[last].moveTo(leftmostX - tileWidth, layer.parts[last].pos.y);
            layer.parts.unshift(layer.parts.pop());
        }

        for (const part of layer.parts) {
            part.move(velocity, 0);
        }
    }

    for (const item of scrollingItems) {
        let velocity = direction === "right" ? item.speed : -item.speed;
        velocity *= speedModifier;
        item.obj.move(velocity, 0);
    }
}