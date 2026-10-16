// things to import from const: gravity
import { scroll } from "./Bg.js";
import { selectedDirectionBtn, store } from "../store";
import { getScale } from "../helpers/scale.js";

export default function makeGirlie(k, mask, posVec2, speed) {
    // this has k.anchor(), k.area(), k.body(), k.pos(), k.sprite - with default anim
    // girlie is a child of `mask`, so posVec2 is mask-local and she shares the
    // scene's coordinate space / z-order with the bulbs and falling skills.

    const SCALE = getScale();

    // Jump impulse. Peak height ≈ JUMP_FORCE² / (2 * gravity); with gravity 200,
    // 400 clears ~400px — plenty to clear a falling block. Tune to taste.
    // const JUMP_FORCE = 100;

    // She must be continuously grounded for this long before she can jump again.
    // const JUMP_COOLDOWN = 3; // seconds
    // let groundedTime = 0;      // how long she's been grounded without a break

    const idle = "idle-right";
    const girlie = mask.add([
        k.sprite("girlie", {anim: idle}),
        k.scale(SCALE),
        k.anchor("center"),
        k.area(), //  k.area({ shape: new k.Rect(k.vec2(0), 5, 10)}), 
        k.body(),
        // k.doubleJump(0), 
        k.pos(posVec2),
        k.z(995),
        "girlie",
        // custom vars
        {
            direction: "right",
            animationDirection: idle,
            isBusy: false, // true while a scripted action (e.g. watering) owns the sprite
            // canJump: false,

        },
    ]);

    // controls
    // let wasLifting = false;

    girlie.onUpdate(() => {

        // While a scripted action owns the girlie (e.g. watering a flower), don't let the
        // movement state machine below fight it for the animation — and since scroll() is
        // only ever called inside this loop, bailing here also freezes the world.
        if (girlie.isBusy) return;

        // Input comes from EITHER the keyboard OR the on-screen (touch) buttons.
        // The buttons publish the pressed direction to selectedDirectionBtn; translate
        // it back into the same flags the keyboard produces so ONE movement block
        // below handles both sources.
        let up, left, right, down, shift;

        const btn = store.get(selectedDirectionBtn); // "" | "leftleft" | "left" | "up" | "right" | "rightright"
        if (btn !== "") {
            left  = btn === "left"  || btn === "leftleft";
            right = btn === "right" || btn === "rightright";
            up    = btn === "up";
            down  = false;
            shift = btn === "leftleft" || btn === "rightright"; // double-arrow = run
        } else {
            up    = k.isKeyDown("up");
            left  = k.isKeyDown("left");
            right = k.isKeyDown("right");
            down  = k.isKeyDown("down");
            shift = k.isKeyDown("shift");
        }

        // Accumulate how long she's been continuously grounded; any airborne frame
        // resets it. This enforces the jump cooldown below.
        // if (girlie.isGrounded()) {
        //     groundedTime += k.dt();
        // } else {
        //     groundedTime = 0;
        // }

        // Launch her upward on "up" — but only once she's been grounded for at
        // least JUMP_COOLDOWN, so she can't re-launch the instant she lands (and
        // holding up can't machine-gun jumps). Consume the timer on jump.
        // if (up && girlie.isGrounded() && groundedTime >= JUMP_COOLDOWN) {
        //     girlie.jump(JUMP_FORCE);
        //     groundedTime = 0;
        // }

        

        // const isLifting = down && (left || right);
        const isRunning = shift && (left || right);
        let anim;

        // if (isLifting) {
        //     girlie.direction = left ? "left" : "right";
        //     anim = `lift-${girlie.direction}`;
        // }
        if (up && left) {
            girlie.direction = "left";
            anim = `jump-${girlie.direction}`;
            scroll(k, girlie.direction);
        }
        else if (up && right) {
            girlie.direction = "right";
            anim = `jump-${girlie.direction}`;
            scroll(k, girlie.direction);
        }
        else if (left) {
            girlie.direction = "left";
            if (isRunning) {
                anim = `run-${girlie.direction}`;
                scroll(k, girlie.direction, false);
            }
            else {
                anim = `walk-${girlie.direction}`;
                scroll(k, girlie.direction);
            }
        }
        else if (right) {
            girlie.direction = "right";
            if (isRunning) {
                anim = `run-${girlie.direction}`;
                scroll(k, girlie.direction, false);
            }
            else {
                anim = `walk-${girlie.direction}`;
                scroll(k, girlie.direction);
            }
        }
        else if (up) {
            anim = `jump-${girlie.direction}`;
        }
        else {
            anim = `idle-${girlie.direction}`;
        }

        // const justStartedLifting = isLifting && !wasLifting;

        // if (justStartedLifting || (!isLifting && girlie.curAnim() !== anim)) {
        //     girlie.play(anim);
        // }

        // wasLifting = isLifting;

        // if pos is too close to the edge, stop moving ?
    })

    return girlie;
}
