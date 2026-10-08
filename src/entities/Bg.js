import { PARALLAX_WIDTH, SCALE_REFERENCE } from "../constants.js";
import { getScale } from "../helpers/scale.js";

export const GROUND_SPEED = -16;
let layers = null;
let scrollingItems = [];

export function makeLayers(k, mask) {
        const SCALE = getScale();
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

    const SCALE = getScale();

    // Reset scroll registrations on every (re)build: the scene is rebuilt from
    // scratch on resize, so without this attachToScroll() would keep appending
    // entries that point at destroyed objects from the previous build.
    scrollingItems = [];

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

    const SCALE = getScale();
    const tileWidth = PARALLAX_WIDTH * SCALE;
    let speedModifier = 5
    if (!walk) speedModifier = 20;
    // Normalize world speed across zoom levels: a bigger SCALE means a bigger
    // world, so without this a fixed pixel velocity feels fast when zoomed out
    // (small SCALE) and slow when zoomed in. Dividing by SCALE_REFERENCE keeps
    // the desktop feel identical while fixing the "too fast on mobile" case.
    speedModifier *= SCALE / SCALE_REFERENCE;

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