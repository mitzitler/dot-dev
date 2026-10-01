import { PALETTE, PARALLAX_HEIGHT, PARALLAX_WIDTH, SCALE, DIST_FROM_CENTER_TO_GROUND_HEIGHT } from "./constants";
import makeKaplayCtx from "./kaplayCtx";
import { makeAppear } from "./utils";
import makeGirlie from "./entities/Girlie";
import makeBackground, { GROUND_SPEED, attachToScroll } from "./entities/Bg";
import makeLightbulb from "./entities/Lightbulb";
import makeFlower from "./entities/Flower";
import makeTooltipBox from "./components/TooltipBox";
import makeControls from "./components/Controls";
import startLoadSequence from "./helpers/loadSequence";

import {GIRLIE_IDLE_RIGHT_FRAMES, GIRLIE_IDLE_LEFT_FRAMES, GIRLIE_WALK_RIGHT_FRAMES, 
    GIRLIE_WALK_LEFT_FRAMES, GIRLIE_RUN_RIGHT_FRAMES, GIRLIE_RUN_LEFT_FRAMES, 
    GIRLIE_JUMP_RIGHT_FRAMES, GIRLIE_JUMP_LEFT_FRAMES, GIRLIE_LIFT_RIGHT_FRAMES, 
    GIRLIE_LIFT_LEFT_FRAMES, GIRLIE_WATER_RIGHT_FRAMES, GIRLIE_WATER_LEFT_FRAMES
} from "./anims";

export default async function initGame() {

    // const generalData = await( await fetch('./configs/generalData.json')).json();
    // const socialsData = await( await fetch('./configs/socialsData.json')).json();
    // const skillsData = await( await fetch('./configs/skillsData.json')).json();
    // const experiencesData = await( await fetch('./configs/experiencesData.json')).json();
    // const projectsData = await( await fetch('./configs/projectsData.json')).json();
    const toolboxData = await( await fetch('./configs/toolBoxTexts.json')).json();
    
    const k = makeKaplayCtx();
    k.loadSprite("nametag", "./sprites/nametag.png");

    k.loadSprite("bg-sky", "./sprites/bg-sky.png");
    k.loadSprite("bg-clouds-back", "./sprites/bg-clouds-back.png");
    k.loadSprite("bg-clouds-front", "./sprites/bg-clouds-front.png");
    k.loadSprite("bg-mountains", "./sprites/bg-mountains.png");
    k.loadSprite("bg-hills", "./sprites/bg-hills.png");
    k.loadSprite("bg-trees-back", "./sprites/bg-trees-back.png");
    k.loadSprite("bg-trees-front", "./sprites/bg-trees-front.png");
    k.loadSprite("bg-ground", "./sprites/bg-ground.png");
    k.loadSprite("bg-frame", "./sprites/bg-frame.png");

    k.loadSprite("girlie", "./sprites/purple_girlie2.png",
        {
        sliceX: 10,
        sliceY: 9,
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
        }
    });
    k.loadSprite("lightbulb", "./sprites/lightbulb-updated.png", 
        {
        sliceX: 3,
        sliceY: 2,
        anims: {
            "off": 0,
            "lighting": {from: 0, to: 5, loop: false, speed: 1.8},
            "on": {frames: [4, 4, 4, 4, 4, 4, 4, 4, 5, 5], loop: true, speed: 0.3},
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

    )
    // fonts
    k.loadFont("wellbutrin", "./fonts/Welbut__.ttf");
        k.loadShaderURL("halvedPattern", null, "./shaders/halvedPattern.frag");

    // permanent 50/50 background, sits behind the mask/parallax scene forever
    k.add([
        k.uvquad(k.width(), k.height()),
        k.shader("halvedPattern", () => ({
            u_color1: k.Color.fromHex(PALETTE.colorBeige),
            u_color2: k.Color.fromHex(PALETTE.colorBrownDark),
            u_progress: 0,
        })),
        k.pos(0,0),
        k.fixed(),
    ])

     // this was in bg originally
    let topLeftX = k.center().x - (PARALLAX_WIDTH*SCALE/2);
    let topLeftY = k.center().y - (PARALLAX_HEIGHT*SCALE/2);

    const mask = k.add([
        k.pos(topLeftX, topLeftY),
        k.rect(PARALLAX_WIDTH*SCALE, PARALLAX_HEIGHT*SCALE), // Size of the masked clipping area
        k.mask("intersect"),
    ]);

    makeBackground(k, mask);

    if (k.isTouchscreen()) makeControls(k, k.vec2(k.center().x, topLeftY+(PARALLAX_HEIGHT*SCALE)));

    let girlie = makeGirlie(
        k,
        k.vec2(k.center().add(0, (SCALE * DIST_FROM_CENTER_TO_GROUND_HEIGHT))),
        30
    );

    // add a random amount in X ?

    // add this to helpers
    const delay = (durationMs) => {
        return new Promise(resolve => setTimeout(resolve, durationMs));
    }

    // this needs to be quarantined better
    let lb1 = makeLightbulb(
        k,
        mask,
        k.vec2(
            ((PARALLAX_WIDTH * SCALE) / 2) + 200, 
            ((PARALLAX_HEIGHT * SCALE) / 2) + 100
        ),
    )
    lb1.id = "about-me";
    attachToScroll(lb1, GROUND_SPEED);

    lb1.onCollide("girlie", () => {
        if (lb1.isOn) return;
        lb1.isOn = true;

        lb1.play("lighting");
        lb1.onAnimEnd(anim => { if (anim === "lighting") {
            lb1.play("on");
            lb1.stop();
        } }) 

        const topCenter = k.vec2(0, -lb1.height / 2);
        makeTooltipBox(k, lb1, topCenter, toolboxData[0], 2.5)
    })

    if (lb1.isOn) {
        lb1.play("on");
        lb1.stop();
    }



    // this is the flower bit
        /*

        -- the idea with the flower should be:
        -- flower anim happens on collide, girlie watering happens on collide
        -- nothing else happens - this is not responsible for any information delivery

        
    let flower = makeFlower(
        k,
        mask,
        k.vec2(
            ((PARALLAX_WIDTH * SCALE) / 2) + 600, 
            ((PARALLAX_HEIGHT * SCALE) / 2) + 375
        )
    )
    attachToScroll(flower, GROUND_SPEED);

    flower.onCollide("girlie", () => {
        if (flower.isBloomed) return;
        flower.isBloomed = true;

        girlie.play("watering-right");
        flower.play("blooming");
        flower.onAnimEnd(anim => { if (anim === "blooming") {
            flower.play("bloomed");
            flower.stop();
        }})
    })
        */

    const shaderProgress = { value: 0 };
    const shaderEntity = k.add([
        k.uvquad(k.width(), k.height()),
        k.shader("halvedPattern", () => ({
            u_color1: k.Color.fromHex(PALETTE.colorBeige),
            u_color2: k.Color.fromHex(PALETTE.colorBrownDark),
            u_progress: shaderProgress.value,
        })),
        k.pos(0,0),
        k.fixed(),
        k.z(1000), // above girlie/lb1/flower (max 999), below the nametag (1001)
    ])

    await startLoadSequence(k, shaderEntity, shaderProgress);
}