import { getScale } from "../helpers/scale.js";

export const MARQUEE_SPEED = -10;

export function makeMarquee(k, posVec2, sprite, anchor) {

    const SCALE = getScale();
    const marqueeWidth = 1052;
    const marqueeHeight = 28;

    const tileWidth = marqueeWidth * SCALE;

    // Static container so children clean up with it. It does NOT move or scale,
    // so child positions map 1:1 to the screen.
    const marqueeRow = k.add([
        k.pos(posVec2),
        k.anchor(anchor),
    ]);

    // Enough tiles to cover the screen, plus one spare to fill the gap as we scroll.
    const tileCount = Math.ceil(k.width() / tileWidth) + 1;

    const tiles = [];
    for (let i = 0; i < tileCount; i++) {
        const tile = marqueeRow.add([
            k.sprite(sprite),
            k.pos(i * tileWidth, 0),   // local x, laid out edge-to-edge
            k.scale(SCALE),            // scale applied once, here only
            k.anchor(anchor),
        ]);
        tiles.push(tile);
    }

    marqueeRow.onUpdate(() => {
        for (const tile of tiles) {
            tile.move(MARQUEE_SPEED, 0);
        }

        // Recycle any tile that has fully scrolled off the left edge by placing
        // it to the right of the current right-most tile.
        for (const tile of tiles) {
            if (tile.pos.x + tileWidth < 0) {
                const rightMostX = Math.max(...tiles.map((t) => t.pos.x));
                tile.pos.x = rightMostX + tileWidth;
            }
        }
    });

    return marqueeRow;
}
