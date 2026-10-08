import { PALETTE, PARALLAX_HEIGHT, PARALLAX_WIDTH, DIST_FROM_CENTER_TO_GROUND_HEIGHT, CONTACTS_Y_OFFSET, SCALE_REFERENCE } from "./constants";
import makeKaplayCtx from "./kaplayCtx";
import makeGirlie from "./entities/Girlie";
import makeBackground, { GROUND_SPEED, attachToScroll } from "./entities/Bg";
import makeLightbulb from "./entities/Lightbulb";
// import makeFlower from "./entities/Flower";
import makeTooltipBox from "./components/TooltipBox";
import makeContacts from "./components/Contacts.js";
import makeControls from "./components/Controls";
import startLoadSequence from "./helpers/loadSequence";
import resizeScale from "./helpers/resizeScale";
import { setScale, getScale } from "./helpers/scale.js";

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

    // ---- one-time asset loading ----
    // Assets are global in Kaplay and survive scene switches, so load everything
    // ONCE here (not inside buildScene, which re-runs on every resize).
    k.loadSprite("nametag", "./sprites/nametag.png");
    k.loadSprite("nametag_large", "./sprites/nametag_large.png");

    k.loadSprite("bg-sky", "./sprites/bg-sky.png");
    k.loadSprite("bg-clouds-back", "./sprites/bg-clouds-back.png");
    k.loadSprite("bg-clouds-front", "./sprites/bg-clouds-front.png");
    k.loadSprite("bg-mountains", "./sprites/bg-mountains.png");
    k.loadSprite("bg-hills", "./sprites/bg-hills.png");
    k.loadSprite("bg-trees-back", "./sprites/bg-trees-back.png");
    k.loadSprite("bg-trees-front", "./sprites/bg-trees-front.png");
    k.loadSprite("bg-ground", "./sprites/bg-ground.png");
    k.loadSprite("bg-frame", "./sprites/bg-frame.png");

    // control buttons (touch) — each sheet is 2 frames: 0 = resting, 1 = pressed
    k.loadSprite("btn-up", "./sprites/btn-control-up.png", {sliceX: 2, sliceY: 1});
    k.loadSprite("btn-left", "./sprites/btn-control-left.png", {sliceX: 2, sliceY: 1});
    k.loadSprite("btn-right", "./sprites/btn-control-right.png", {sliceX: 2, sliceY: 1});
    k.loadSprite("btn-down", "./sprites/btn-control-down.png", {sliceX: 2, sliceY: 1});
    k.loadSprite("btn-leftleft", "./sprites/btn-control-leftleft.png", {sliceX: 2, sliceY: 1});
    k.loadSprite("btn-rightright", "./sprites/btn-control-rightright.png", {sliceX: 2, sliceY: 1});

    // contact bar
    k.loadSprite("contact_me", "./sprites/contact_me.png", {sliceX:1, sliceY: 1});
    k.loadSprite("btn-email", "./sprites/btn-contact-email.png", {sliceX:2, sliceY: 1});
    k.loadSprite("btn-github", "./sprites/btn-contact-github.png", {sliceX:2, sliceY: 1});
    k.loadSprite("btn-linkedin", "./sprites/btn-contact-linkedin.png", {sliceX:2, sliceY: 1});

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

    // The intro wipe only plays on the very first build, not on resize rebuilds.
    let firstLoad = true;

    // ---- scene build (re-runs from scratch on every resize) ----
    function buildScene() {
        // Single source of truth: derive the scale from the current viewport and
        // publish it so every make* function and scroll() reads the same value.
        setScale(resizeScale(k));
        const SCALE = getScale();

        // permanent 50/50 background, sits behind the mask/parallax scene forever.
        // Uses k.width()/k.height(), so it must live here to track the viewport.
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

        // Touch controls only — desktop is keyboard-driven.
        if (k.isTouchscreen()) {
            makeControls(k, k.vec2(k.center().x, topLeftY+((30+PARALLAX_HEIGHT)*SCALE)))
        };

        makeContacts(k, k.vec2(k.center().x, topLeftY-(CONTACTS_Y_OFFSET*SCALE)));

        let girlie = makeGirlie(
            k,
            k.vec2(k.center().add(0, (SCALE * DIST_FROM_CENTER_TO_GROUND_HEIGHT))),
            30
        );

        // this needs to be quarantined better
        // Offsets from the parallax center. They were hand-tuned as pixels at the
        // reference (old desktop) scale, so multiply by SCALE/SCALE_REFERENCE to
        // keep that exact placement on desktop while staying on the ground when
        // zoomed in on mobile (an unscaled +150/+75 drifts off at other scales).
        const offsetScale = SCALE / SCALE_REFERENCE;
        let lb1 = makeLightbulb(
            k,
            mask,
            k.vec2(
                ((PARALLAX_WIDTH * SCALE) / 2) + 150 * offsetScale,
                ((PARALLAX_HEIGHT * SCALE) / 2) + 75 * offsetScale
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

        if (firstLoad) {
            firstLoad = false;
            // fire-and-forget: k.go() does not await, and the intro self-manages
            // via tweens. On resize rebuilds we skip it and jump straight to the scene.
            startLoadSequence(k, shaderEntity, shaderProgress);
        } else {
            // no intro curtain on rebuilds — reveal the scene immediately
            shaderEntity.destroy();
        }
    }

    k.scene("main", () => buildScene());
    k.go("main");

    // Rebuild the scene on resize so SCALE and every position are recomputed from
    // the fresh viewport — no reload needed. Registered ONCE here (outside the
    // scene callback, which would otherwise stack a handler per k.go). Debounced
    // so dragging the window doesn't thrash rebuilds. k.go doesn't change the
    // canvas size, so this won't re-fire itself.
    let resizeTimer;
    k.onResize(() => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => k.go("main"), 120);
    });
}
