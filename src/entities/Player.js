import { isEmailModalVisibleAtom, isProjectModalVisibleAtom, isSocialModalVisibleAtom, store } from "../store.js";
import { DIAGONAL_FACTOR } from "./../constants.js";

export default function makePlayer(k, posVec2, speed) {
    const player = k.add([
        k.sprite("player", {anim: "walk-down-idle"}),
        k.scale(8),
        k.anchor("center"),
        k.area({ shape: new k.Rect(k.vec2(0), 5, 10)}),
        k.body(),
        k.pos(posVec2),
        "player",
        {
            direction: k.vec2(0,0),
            directionName: "walk-down",
        },
    ]);

    // TODO player controls, etc
    // these controls are very mouse/touch specific
    let isTouchMotion = false, isKeyMotion = false;
    const game = document.getElementById("game");
    game.addEventListener("focusout", () => {
        isTouchMotion = false;
        isKeyMotion = false;
    });
    game.addEventListener("touchstart", () => {
        isTouchMotion = true;
        isKeyMotion = false;
    });
    game.addEventListener("touchend", () => {
        isTouchMotion = false;
        isKeyMotion = false;
    });

    player.onUpdate(() => {
        if (!k.getCamPos().eq(player.pos)) {
            k.tween(
                k.getCamPos(), // start pos
                player.pos, // end pos
                0.2, // speed of change
                (newPos) => k.setCamPos(newPos), // changing new to new
                k.easings.linear, // the easing function
            );
        }

        if (store.get(isSocialModalVisibleAtom) || store.get(isEmailModalVisibleAtom) || store.get(isProjectModalVisibleAtom))
            return;

        player.direction = k.vec2(0,0);
        const worldMousePos = k.toWorld(k.mousePos());

        if (isTouchMotion) {
            player.direction = worldMousePos.sub(player.pos).unit();
        }
    
        const up = k.isKeyDown("up");
        const down = k.isKeyDown("down");
        const left = k.isKeyDown("left");
        const right = k.isKeyDown("right");

        if (up || down || left || right) {
            let x_new = 0, y_new = 0;
            // const up    = k.isKeyDown("up");
            // const down  = k.isKeyDown("down");
            // const left  = k.isKeyDown("left");
            // const right = k.isKeyDown("right");

            if      (up && left)  { x_new = -0.5; y_new = -0.7; player.directionName = "walk-left-up"; }
            else if (up && right) { x_new =  0.5; y_new = -0.7; player.directionName = "walk-right-up"; }
            else if (down && left)  { x_new = -0.5; y_new =  0.7; player.directionName = "walk-left-down"; }
            else if (down && right) { x_new =  0.5; y_new =  0.7; player.directionName = "walk-right-down"; }
            else if (up)    { x_new = 0.01; y_new = -0.9; player.directionName = "walk-up"; }
            else if (down)  { x_new = 0.01; y_new =  0.9; player.directionName = "walk-down"; }
            else if (left)  { x_new = -0.5; y_new =  0; player.directionName = "walk-left"; }
            else if (right) { x_new =  0.5; y_new =  0; player.directionName = "walk-down"; }

            player.direction = k.vec2(x_new, y_new);
        }

        else {
            player.play(`${player.directionName}-idle`);
            return;
        }

        if (player.direction.eq(k.vec2(0,0)) && !player.getCurAnim().name.includes("idle")) {
            player.play(`${player.directionName}-idle`);
            return;
        }

        if (
            player.direction.x > 0 &&
            player.direction.y > -0.5 &&
            player.direction.y < 0.5
        ) {
            player.directionName = "walk-right";
        }

        if (
            player.direction.x < 0 &&
            player.direction.y > -0.5 &&
            player.direction.y < 0.5
        )
            player.directionName = "walk-left";

        if (player.direction.x <= 0 && player.direction.y < -0.8)
            player.directionName = "walk-up";

        if (player.direction.x <= 0 && player.direction.y > 0.8)
            player.directionName = "walk-down";

        if (
            player.direction.x < 0 &&
            player.direction.y > -0.8 &&
            player.direction.y < -0.5
        )
            player.directionName = "walk-left-up";

        if (
            player.direction.x < 0 &&
            player.direction.y > 0.5 &&
            player.direction.y < 0.8
        )
            player.directionName = "walk-left-down";

        if (
            player.direction.x > 0 &&
            player.direction.y < -0.5 &&
            player.direction.y > -0.8
        )
            player.directionName = "walk-right-up";

        if (
            player.direction.x > 0 &&
            player.direction.y > 0.5 &&
            player.direction.y < 0.8
        )
            player.directionName = "walk-right-down";

        if (player.getCurAnim().name !== player.directionName) {
            player.play(player.directionName);
        }

        if (player.direction.x && player.direction.y) {
            player.move(player.direction.scale(DIAGONAL_FACTOR * speed));
        return;
        }

        player.move(player.direction.scale(speed))

    });

    return player;
}