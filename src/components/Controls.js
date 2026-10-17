import { selectedDirectionBtn, store } from "../store";
import { getScale } from "../helpers/scale.js";

// WARNING: these on-screen controls are intended for touchscreen / mobile only.
// On desktop the site is driven by the keyboard, so gate this behind a
// touchscreen check (e.g. k.isTouchscreen()) before calling makeControls.
// Button sprites are loaded once in initGame (assets are global in Kaplay).

export default function makeControls(k, posVec2, handlers = {}) {
    // the pos will be the top left corner?

    let area;

    const SCALE = getScale();
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

    // frame 0 = resting, frame 1 = pressed
    const RESTING = 0;
    const PRESSED = 1;

    const x_gap = 16 * SCALE; // scales with the buttons so spacing stays proportional at every size
    const midY = height * SCALE / 2;

    // left-to-right order; w is the native (unscaled) frame width — btnScale is
    // applied by the loop below, so don't pre-scale these (wide = 48, standard = 32)
    const btnDefs = [
        { name: "btn-leftleft", w: 48, y_offset: 0, x_gap_bool: true },
        { name: "btn-left", w: 32, y_offset: 0, x_gap_bool: true },
        { name: "btn-up", w: 32, y_offset: -24, x_gap_bool: true },
        { name: "btn-s", w: 32, y_offset: 24, x_gap_bool: false, action: "btn-s" },
        { name: "btn-right", w: 32, y_offset: 0, x_gap_bool: true },
        { name: "btn-rightright", w: 48, y_offset: 0, x_gap_bool: true },
    ];

    // total row width so we can center the buttons horizontally in the bar.
    // Only the buttons laid out IN the row (x_gap_bool) count toward the width —
    // the stacked button (btn-s sits UNDER btn-up) must not add to it at all.
    const rowBtns = btnDefs.filter((d) => d.x_gap_bool);
    const rowWidth =
        rowBtns.reduce((sum, d) => sum + d.w * SCALE, 0) +
        x_gap * (rowBtns.length - 1);

    const buttons = {};
    let cursorX = (width * SCALE - rowWidth) / 2; // left edge of the first button
    let prevCursorX;

    for (const def of btnDefs) {
        const dir = def.name.replace("btn-", ""); // "leftleft" | "left" | "up" | "right" | "rightright"
        let x = def.x_gap_bool ? cursorX : prevCursorX;
        const btn = area.add([
            // local coords: parent's topleft anchor puts (0,0) at the rect's top-left corner
            k.sprite(def.name, { frame: RESTING }),
            k.scale(SCALE),
            k.anchor("left"),
            k.pos(x, midY + def.y_offset * SCALE), // scale the up-button lift like everything else
            k.area(),
            k.z(999),
            def.name,
        ]);

        if (def.action) {
            // Action button (e.g. btn-s) — the mobile equivalent of a key press.
            // Fire ONCE per tap (rising edge of mouse-down while hovering), exactly
            // like k.onKeyPress, show the pressed frame, and NEVER touch
            // selectedDirectionBtn / movement.
            const fn = handlers[def.action];
            let wasDown = false;
            btn.onHoverUpdate(() => {
                const down = k.isMouseDown();
                if (down && !wasDown) {
                    btn.frame = PRESSED;
                    fn?.();
                } else if (!down) {
                    btn.frame = RESTING;
                }
                wasDown = down;
            });
            btn.onHoverEnd(() => {
                btn.frame = RESTING;
                wasDown = false;
            });
        } else {
            // Direction button: while held, show the pressed frame AND publish this
            // button's direction to the store. Girlie reads selectedDirectionBtn every
            // frame and moves. Clear it on release so movement stops.
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
        }

        buttons[def.name] = btn;
        // Stacked buttons (x_gap_bool false, e.g. btn-s under btn-up) sit on top of
        // the previous row button and must NOT advance the cursor — otherwise they
        // add their width + a gap to the row and push everything after them over.
        if (def.x_gap_bool) {
            prevCursorX = cursorX;
            cursorX += def.w * SCALE + x_gap;
        }
    }

    return area;
}
