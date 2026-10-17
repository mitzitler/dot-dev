import {
    GIRLIE_IDLE_RIGHT_FRAMES, GIRLIE_IDLE_LEFT_FRAMES, GIRLIE_WALK_RIGHT_FRAMES,
    GIRLIE_WALK_LEFT_FRAMES, GIRLIE_RUN_RIGHT_FRAMES, GIRLIE_RUN_LEFT_FRAMES,
    GIRLIE_JUMP_RIGHT_FRAMES, GIRLIE_JUMP_LEFT_FRAMES, GIRLIE_LIFT_RIGHT_FRAMES,
    GIRLIE_LIFT_LEFT_FRAMES, GIRLIE_WATER_RIGHT_FRAMES, GIRLIE_WATER_LEFT_FRAMES,
    GIRLIE_IDLE_RIGHT_BW_FRAMES, GIRLIE_IDLE_LEFT_BW_FRAMES
} from "../anims";

// All one-time asset loading. Assets are global in Kaplay and survive scene
// switches, so this is called ONCE from initGame (not inside buildScene, which
// re-runs on every resize).
export function loadSprites(k) {
    k.loadSprite("nametag_large", "./sprites/nametag_large.png");

    // each sprite is 2 frame: 0 is normal focus, 1 is "modal screen focus"
    // this simulates a black and white or blurry background to make the main screen "out of focus"
    // when a modal pops up, but without ruining the mission of keeping pixel and palette integrity
    k.loadSprite("bg-sky", "./sprites/bg-sky.png", {sliceX: 2, sliceY: 1});
    k.loadSprite("bg-clouds-back", "./sprites/bg-clouds-back.png", {sliceX: 2, sliceY: 1});
    k.loadSprite("bg-clouds-front", "./sprites/bg-clouds-front.png", {sliceX: 2, sliceY: 1});
    k.loadSprite("bg-mountains", "./sprites/bg-mountains.png", {sliceX: 2, sliceY: 1});
    k.loadSprite("bg-hills", "./sprites/bg-hills.png", {sliceX: 2, sliceY: 1});
    k.loadSprite("bg-trees-back", "./sprites/bg-trees-back.png", {sliceX: 2, sliceY: 1});
    k.loadSprite("bg-trees-front", "./sprites/bg-trees-front.png", {sliceX: 2, sliceY: 1});
    k.loadSprite("bg-ground", "./sprites/bg-ground.png", {sliceX: 2, sliceY: 1});
    // k.loadSprite("bg-frame", "./sprites/bg-frame.png");

    k.loadSprite("marquee1", "./sprites/marquee1.png");
    k.loadSprite("marquee2", "./sprites/marquee2.png");

    // control buttons (touch) — each sheet is 2 frames: 0 = resting, 1 = pressed
    k.loadSprite("btn-up", "./sprites/btn-control-up.png", {sliceX: 2, sliceY: 1});
    k.loadSprite("btn-left", "./sprites/btn-control-left.png", {sliceX: 2, sliceY: 1});
    k.loadSprite("btn-right", "./sprites/btn-control-right.png", {sliceX: 2, sliceY: 1});
    k.loadSprite("btn-down", "./sprites/btn-control-down.png", {sliceX: 2, sliceY: 1});
    k.loadSprite("btn-leftleft", "./sprites/btn-control-leftleft.png", {sliceX: 2, sliceY: 1});
    k.loadSprite("btn-rightright", "./sprites/btn-control-rightright.png", {sliceX: 2, sliceY: 1});
    k.loadSprite("btn-s", "./sprites/btn-control-s.png", {sliceX: 2, sliceY: 1});

    // contact bar
    k.loadSprite("btn-email", "./sprites/btn-contact-email.png", {sliceX:2, sliceY: 1});
    k.loadSprite("btn-github", "./sprites/btn-contact-github.png", {sliceX:2, sliceY: 1});
    k.loadSprite("btn-linkedin", "./sprites/btn-contact-linkedin.png", {sliceX:2, sliceY: 1});

    // skills
    k.loadSprite("btn-skill-cpp", "./sprites/btn-skill-cpp.png", {sliceX:2, sliceY: 1});
    k.loadSprite("btn-skill-databricks", "./sprites/btn-skill-databricks.png", {sliceX:2, sliceY: 1});
    k.loadSprite("btn-skill-java", "./sprites/btn-skill-java.png", {sliceX:2, sliceY: 1});
    k.loadSprite("btn-skill-python", "./sprites/btn-skill-python.png", {sliceX:2, sliceY: 1});
    k.loadSprite("btn-skill-react", "./sprites/btn-skill-react.png", {sliceX:2, sliceY: 1});
    k.loadSprite("btn-skill-svelte", "./sprites/btn-skill-svelte.png", {sliceX:2, sliceY: 1});
    k.loadSprite("btn-skill-typescript", "./sprites/btn-skill-typescript.png", {sliceX:2, sliceY: 1});

    // k.loadSprite("girlie", "./sprites/purple_girlie2.png",
    //     {
    //     sliceX: 10,
    //     sliceY: 9,
    //     anims: {
    //         "idle-right": {frames: GIRLIE_IDLE_RIGHT_FRAMES, loop: true},
    //         "idle-left": {frames: GIRLIE_IDLE_LEFT_FRAMES, loop: true},
    //         "walk-right": {frames: GIRLIE_WALK_RIGHT_FRAMES, loop: true, speed: 12 },
    //         "walk-left": {frames: GIRLIE_WALK_LEFT_FRAMES, loop: true, speed: 12 },
    //         "run-right": {frames: GIRLIE_RUN_RIGHT_FRAMES, loop: true, speed: 24 },
    //         "run-left": {frames: GIRLIE_RUN_LEFT_FRAMES, loop: true, speed: 24 },
    //         "jump-right": {frames: GIRLIE_JUMP_RIGHT_FRAMES, loop: false},
    //         "jump-left": {frames: GIRLIE_JUMP_LEFT_FRAMES, loop: false},

    //         "watering-right": {frames: GIRLIE_WATER_RIGHT_FRAMES, loop: false},
    //         "watering-left": {frames: GIRLIE_WATER_LEFT_FRAMES, loop: false},

    //         "lift-right": {frames: GIRLIE_LIFT_RIGHT_FRAMES, loop: false},
    //         "lift-left": {frames: GIRLIE_LIFT_LEFT_FRAMES, loop: false},
    //     }
    // });
    k.loadSprite("girlie", "./sprites/purple_girlie2_with_bw.png",
        {
        sliceX: 14,
        sliceY: 13,
        anims: {
            "idle-right": {frames: GIRLIE_IDLE_RIGHT_FRAMES, loop: true},
            "idle-left": {frames: GIRLIE_IDLE_LEFT_FRAMES, loop: true},
            "walk-right": {frames: GIRLIE_WALK_RIGHT_FRAMES, loop: true, speed: 12 },
            "walk-left": {frames: GIRLIE_WALK_LEFT_FRAMES, loop: true, speed: 12 },
            "run-right": {frames: GIRLIE_RUN_RIGHT_FRAMES, loop: true, speed: 24 },
            "run-left": {frames: GIRLIE_RUN_LEFT_FRAMES, loop: true, speed: 24 },
            "jump-right": {frames: GIRLIE_JUMP_RIGHT_FRAMES, loop: false},
            "jump-left": {frames: GIRLIE_JUMP_LEFT_FRAMES, loop: false},

            "watering-right": {frames: GIRLIE_WATER_RIGHT_FRAMES, loop: false},
            "watering-left": {frames: GIRLIE_WATER_LEFT_FRAMES, loop: false},

            "lift-right": {frames: GIRLIE_LIFT_RIGHT_FRAMES, loop: false},
            "lift-left": {frames: GIRLIE_LIFT_LEFT_FRAMES, loop: false},

            "idle-bw-right": {frames: GIRLIE_IDLE_RIGHT_BW_FRAMES, loop: true},
            "idle-bw-left": {frames: GIRLIE_IDLE_LEFT_BW_FRAMES, loop: true},

        }
    });
    k.loadSprite("lightbulb", "./sprites/lightbulb.png",
        {
        sliceX: 3,
        sliceY: 3,
        anims: {
            "off": 0,
            "lighting": {from: 0, to: 5, loop: false, speed: 1.1},
            "on": {frames: [4, 4, 4, 4, 4, 4, 4, 4, 5, 5], loop: true, speed: 0.3},
            "turning_off": {frames: [5, 4, 3, 2, 2, 2, 2, 1, 2, 1, 0], loop: false, speed: 0.2},
            "unfocus_off": 6,
            "unfocus_on": 7,
        }
    });
    k.loadSprite("flower", "./sprites/flower.png",
        {
        sliceX:4,
        sliceY: 4,
        anims: {
            "rest": 0,
            "blooming": {from: 0, to: 15, loop: false, speed: 1.5},
            "bloomed": 15,
        }
        }
    );

    // fonts & shaders
    k.loadFont("wellbutrin", "./fonts/Welbut__.ttf");
    k.loadShaderURL("halvedPattern", null, "./shaders/halvedPattern.frag");
}
