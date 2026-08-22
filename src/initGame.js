import makeEmailIcon from "./components/EmailIcon";
import makeSkillIcon from "./components/SkillIcon";
import makeSection from "./components/Section";
import makeSocialIcon from "./components/SocialIcon";
import makeWorkExperienceCard from "./components/WorkExperienceCard";
import makeProjectCard from "./components/ProjectCard";
import { PALETTE, PARALLAX_HEIGHT, PARALLAX_WIDTH, SCALE, DIST_FROM_CENTER_TO_GROUND_HEIGHT } from "./constants";
import makePlayer from "./entities/Player";
import makeKaplayCtx from "./kaplayCtx";
import { store } from "./store";
import { cameraZoomValueAtom } from "./store";
import { makeAppear } from "./utils";
import makeGirlie from "./entities/Girlie";
import makeBackground, { GROUND_SPEED, attachToScroll } from "./entities/Bg";
import makeLightbulb from "./entities/Lightbulb";

export default async function initGame() {

    const generalData = await( await fetch('./configs/generalData.json')).json();
    const socialsData = await( await fetch('./configs/socialsData.json')).json();
    const skillsData = await( await fetch('./configs/skillsData.json')).json();
    const experiencesData = await( await fetch('./configs/experiencesData.json')).json();
    const projectsData = await( await fetch('./configs/projectsData.json')).json();
    
    const k = makeKaplayCtx();
    k.loadSprite("bg-sky", "./sprites/bg-sky.png");
    k.loadSprite("bg-clouds-back", "./sprites/bg-clouds-back.png");
    k.loadSprite("bg-clouds-front", "./sprites/bg-clouds-front.png");
    k.loadSprite("bg-mountains", "./sprites/bg-mountains.png");
    k.loadSprite("bg-hills", "./sprites/bg-hills.png");
    k.loadSprite("bg-trees-back", "./sprites/bg-trees-back.png");
    k.loadSprite("bg-trees-front", "./sprites/bg-trees-front.png");
    k.loadSprite("bg-ground", "./sprites/bg-ground.png");
    k.loadSprite("bg-frame", "./sprites/bg-frame.png");


    k.loadSprite("girlie", "./sprites/purple_girlie.png",
        {
        sliceX: 7,
        sliceY: 6,
        anims: {
            "idle-right": {from: 0, to: 5, loop: true},
            "idle-left": {from: 6, to: 11, loop: true},            
            "walk-right": {frames: [0, 12, 13, 14, 15, 16, 17, 18], loop: true, speed: 12 },
            "walk-left": {frames: [6, 19, 20, 21, 22, 23, 24, 25], loop: true, speed: 12 },
            "lift-right": {frames: [26, 27, 28, 29, 30, 31, 32, 0], loop: false},
            "lift-left": {frames: [33, 34, 35, 36, 37, 38, 39, 40, 6], loop: false}, 
        }
    });
    k.loadSprite("lightbulb", "./sprites/lightbulb.png", 
        {
        sliceX: 3,
        sliceY: 2,
        anims: {
            "off": 0,
            "lighting": {from: 0, to: 5, loop: false, speed: 1.8},
            "on": 5,
        }
    });
    k.loadSprite("player", "./sprites/player.png", 
        {
        
        // because this is a sheet with frames, we get to have addt'l code to specify those
        sliceX: 4, // 4 frames per row
        sliceY: 8, // 8 frames per col
        anims: {
            "walk-down-idle": 0,
            "walk-down": {from: 0, to: 3, loop: true },
            "walk-left-down": {from: 4, to: 7, loop: true},
            "walk-left-down-idle": 4,
            "walk-left": {from: 8, to: 11, loop: true},
            "walk-left-idle": 8, 
            "walk-left-up": {from: 12, to: 15, loop: true},
            "walk-left-up-idle": 12,
            "walk-up": {from: 16, to: 19, loop: true},
            "walk-up-idle": 16,
            "walk-right-up": {from: 20, to: 23, loop: true},
            "walk-right-up-idle": 20,
            "walk-right": {from: 24, to: 27, loop: true },
            "walk-right-idle": 24,
            "walk-right-down": {from: 28, to: 31, loop: true},
            "walk-right-down-idle": 28,
        }

    });
    // fonts
    k.loadFont("ibm-regular", "./fonts/IBMPlexSans-Regular.ttf");
    k.loadFont("ibm-bold", "./fonts/IBMPlexSans-Bold.ttf");
    // logos
    k.loadSprite("github-logo", "./logos/github-logo.png");
    k.loadSprite("linkedin-logo", "./logos/linkedin-logo.png");
    k.loadSprite("youtube-logo", "./logos/youtube-logo.png");
    k.loadSprite("x-logo", "./logos/x-logo.png");
    k.loadSprite("substack-logo", "./logos/substack-logo.png");
    k.loadSprite("js-logo", "./logos/js-logo.png");
    k.loadSprite("ts-logo", "./logos/ts-logo.png");
    k.loadSprite("react-logo", "./logos/react-logo.png");
    k.loadSprite("nextjs-logo", "./logos/nextjs-logo.png");
    k.loadSprite("postgres-logo", "./logos/postgres-logo.png");
    k.loadSprite("html-logo", "./logos/html-logo.png");
    k.loadSprite("css-logo", "./logos/css-logo.png");
    k.loadSprite("tailwind-logo", "./logos/tailwind-logo.png");
    k.loadSprite("python-logo", "./logos/python-logo.png");
    k.loadSprite("email-logo", "./logos/email-logo.png");
    // projects
    k.loadSprite("sonic-js", "./projects/sonic-js.png");
    k.loadSprite("kirby-ts", "./projects/kirby-ts.png");
    k.loadSprite("platformer-js", "./projects/platformer-js.png");
    // shader - look up diff between fragment shaders and vertex shaders
    k.loadShaderURL("tiledPattern", null, "./shaders/tiledPattern.frag");
    k.loadShaderURL("halvedPattern", null, "./shaders/halvedPattern.frag");

    if (k.width() < 1000) {
        store.set(cameraZoomValueAtom, 0.5);
        k.setCamScale(k.vec2(0.5));
    } else {
        store.set(cameraZoomValueAtom, 0.8);
        k.setCamScale(k.vec2(0.8));
    }

    k.onUpdate(() => {
        const camZoomValue = store.get(cameraZoomValueAtom);
        if (camZoomValue !== k.getCamScale())
            k.setCamScale(k.vec2(camZoomValue));
    });


    k.add([
        k.uvquad(k.width(), k.height()),
        k.shader("halvedPattern", () => ({
            u_color1: k.Color.fromHex(PALETTE.colorBlueDark),
            u_color2: k.Color.fromHex(PALETTE.colorBrownDark),
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

    makeGirlie(
        k, 
        k.vec2(k.center().add(0, (SCALE * DIST_FROM_CENTER_TO_GROUND_HEIGHT))),
        30
    );

    // add a random amount in X ?

    let lb1 = makeLightbulb(
        k,
        mask,
        k.vec2(
            ((PARALLAX_WIDTH * SCALE) / 2), 
            ((PARALLAX_HEIGHT * SCALE) / 2) + 150
        ),
    )
    lb1.id = "about-me";
    attachToScroll(lb1, GROUND_SPEED);

    lb1.onCollide("girlie", () => {
        lb1.play("lighting");
        lb1.isOn = true;
    })

    if (lb1.isOn) {
        lb1.play("on");
        lb1.stop();
    }

}