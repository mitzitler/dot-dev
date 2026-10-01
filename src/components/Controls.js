import { PALETTE, SCALE_WIDE, SCALE_MOBILE } from "../constants";
import { selectedDirectionBtn, isMobile, store } from "../store";

// WARNING: these on-screen controls are intended for touchscreen / mobile only.
// On desktop the site is driven by the keyboard, so gate this behind a
// touchscreen check (e.g. k.isTouchscreen()) before calling makeControls.

let SCALE = SCALE_MOBILE;

export default function makeControls(k, posVec2) {
    // the pos will be the top left corner?
   // controls
       // each sheet is 2 frames side by side: frame 0 = resting, frame 1 = pressed
       k.loadSprite("up_btn", "./sprites/up_btn.png", {sliceX: 2, sliceY: 1});
       k.loadSprite("left_btn", "./sprites/left_btn.png", {sliceX: 2, sliceY: 1});
       k.loadSprite("right_btn", "./sprites/right_btn.png", {sliceX: 2, sliceY: 1});
       k.loadSprite("down_btn", "./sprites/down_btn.png", {sliceX: 2, sliceY: 1});
       k.loadSprite("leftleft_btn", "./sprites/leftleft_btn.png", {sliceX: 2, sliceY: 1});
       k.loadSprite("rightright_btn", "./sprites/rightright_btn.png", {sliceX: 2, sliceY: 1});
   

    let area;

    if (store.get(isMobile, true)) {
        SCALE = SCALE_MOBILE;
    }
    else {
        SCALE = SCALE_WIDE;
    }
    // one standard button is 32 x 32
    // wide button is 48 x 32
    const width = 240;
    const height = 80;
    const y_offset = 0;
    area = k.add([
        k.anchor("topleft"),
        k.pos(posVec2.x - (width*SCALE/2),  posVec2.y + y_offset*SCALE),
        k.rect(width*SCALE, height*SCALE),
        k.opacity(0)
    ])

    console.log("i exist")

    // frame 0 = resting, frame 1 = pressed
    const RESTING = 0;
    const PRESSED = 1;

    const x_gap = 36;
    // const btnScale = SCALE*.75;
    const btnScale = SCALE;
    const midY = height * SCALE / 2;

    // left-to-right order; w is the native (unscaled) frame width — btnScale is
    // applied by the loop below, so don't pre-scale these (wide = 48, standard = 32)
    const btnDefs = [
        { name: "leftleft_btn", w: 48, y_offset: 0 },
        { name: "left_btn", w: 32, y_offset: 0 },
        { name: "up_btn", w: 32, y_offset: -36 },
        { name: "right_btn", w: 32, y_offset: 0 },
        { name: "rightright_btn", w: 48, y_offset: 0 },
    ];

    // total row width so we can center the buttons horizontally in the bar
    const rowWidth =
        btnDefs.reduce((sum, d) => sum + d.w * btnScale, 0) +
        x_gap * (btnDefs.length - 1);

    const buttons = {};
    let cursorX = (width * SCALE - rowWidth) / 2; // left edge of the first button

    for (const def of btnDefs) {
        const dir = def.name.replace("_btn", ""); // "leftleft" | "left" | "up" | "right" | "rightright"
        const btn = area.add([
            // local coords: parent's topleft anchor puts (0,0) at the rect's top-left corner
            k.sprite(def.name, { frame: RESTING }),
            k.scale(btnScale),
            k.anchor("left"),
            k.pos(cursorX, midY+def.y_offset),
            k.area(),
            k.z(999),
            def.name,
        ]);

        // While held: show the pressed frame AND publish this button's direction to
        // the store. Girlie reads selectedDirectionBtn every frame and moves.
        // Clear it on release so movement stops.
        // NOTE: pointer/mouse-down driven, so this is meaningful on touch/mobile only.
        const release = () => {
            btn.frame = RESTING;
            if (store.get(selectedDirectionBtn) === dir) store.set(selectedDirectionBtn, "");
        };
        btn.onHoverUpdate(() => {
            if (k.isMouseDown()) {
                btn.frame = PRESSED;
                store.set(selectedDirectionBtn, dir);
            } else {
                release();
            }
        });
        btn.onHoverEnd(release);

        buttons[def.name] = btn;
        cursorX += def.w * btnScale + x_gap;
    }

    return area;
}
