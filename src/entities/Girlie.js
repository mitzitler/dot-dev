// things to import from const: gravity
import { PARALLAX_HEIGHT, PARALLAX_WIDTH, SCALE, DIST_FROM_CENTER_TO_GROUND_HEIGHT} from "../constants.js";
import { scroll } from "./Bg.js";

export default function makeGirlie(k, posVec2, speed) {
    // this has k.anchor(), k.area(), k.body(), k.pos(), k.sprite - with default anim
    const idle = "idle-right";

    const girlie = k.add([
        k.sprite("girlie", {anim: idle}),
        k.scale(SCALE),
        k.anchor("center"),
        k.area(), //  k.area({ shape: new k.Rect(k.vec2(0), 5, 10)}), 
        k.body(),
        k.pos(posVec2),
        k.z(999),
        "girlie",
        // custom vars
        {
            direction: "right", 
            animationDirection: idle,

        },
    ]);

    // controls
    let isTouch = false, isKey = false, wasLifting = false;
    const game = document.getElementById("game");
    game.addEventListener("focusout", () => isTouch = false );
    game.addEventListener("touchstart", () => isTouch = true );
    game.addEventListener("touchend", () => isTouch = false );

    girlie.onUpdate(() => {

        const left = k.isKeyDown("left");
        const right = k.isKeyDown("right");
        const space = k.isKeyDown("space");
        let isLifting = space && (left || right);
        let anim;

        if (isLifting) {
            girlie.direction = left ? "left" : "right";
            anim = `lift-${girlie.direction}`;
        }
        else if (left) {
            girlie.direction = "left";
            anim = `walk-${girlie.direction}`;
            girlie.move(-speed, 0);
            scroll(k, girlie.direction);
        }
        else if (right) {
            girlie.direction = "right";
            anim = `walk-${girlie.direction}`;
            girlie.move(speed, 0);
            scroll(k, girlie.direction);
        }
        else {
            anim = `idle-${girlie.direction}`;
        }

        const justStartedLifting = isLifting && !wasLifting;
        
        if (justStartedLifting || (!isLifting && girlie.curAnim() !== anim)) {
            girlie.play(anim);
        }

        wasLifting = isLifting;

        // if pos is too close to the edge, stop moving ?
    })

}
