import makeEmailIcon from "./components/EmailIcon";
import makeSkillIcon from "./components/SkillIcon";
import makeSection from "./components/Section";
import makeSocialIcon from "./components/SocialIcon";
import makeWorkExperienceCard from "./components/WorkExperienceCard";
import makeProjectCard from "./components/ProjectCard";
import { PALETTE } from "./constants";
import makePlayer from "./entities/Player";
import makeKaplayCtx from "./kaplayCtx";
import { store } from "./store";
import { cameraZoomValueAtom } from "./store";
import { makeAppear } from "./utils";

export default async function initGame() {
    const generalData = await( await fetch('./configs/generalData.json')).json();
    const socialsData = await( await fetch('./configs/socialsData.json')).json();
    const skillsData = await( await fetch('./configs/skillsData.json')).json();
    const experiencesData = await( await fetch('./configs/experiencesData.json')).json();
    const projectsData = await( await fetch('./configs/projectsData.json')).json();
    
    const k = makeKaplayCtx();
    k.loadSprite("player", "./sprites/player.png", {
        
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

    const tiledBackground = k.add([
        k.uvquad(k.width(), k.height()), 
        k.shader("tiledPattern", () => ({
            u_time: k.time() / 20,
            u_color1: k.Color.fromHex(PALETTE.colorBeige),
            u_color2: k.Color.fromHex(PALETTE.colorBlueLight),
            u_speed: k.vec2(1, -1),
            u_aspect: k.width() / k.height(),
            u_size: 5,
        })),
        k.pos(0, 0),
        k.fixed(),
    ]);

    tiledBackground.onUpdate(() => {
        tiledBackground.width = k.width();
        tiledBackground.height = k.height();
        tiledBackground.uniform.u_aspect = k.width() / k.height();

    });

    makeSection(
        k, 
        k.vec2(k.center().x, k.center().y - 400), 
        generalData.section1Name, 
        (parent) => {
            const container = parent.add([k.pos(-805, -700), k.opacity(0)]);
            
            container.add([
                k.text(generalData.header.title, { font: "ibm-bold", size: 88 }),
                k.color(k.Color.fromHex(PALETTE.colorBrownDark)),
                k.pos(395, 0),
                k.opacity(0),
            ]);

            container.add([
                k.text(generalData.header.subtitle, { font: "ibm-bold", size: 48, }),
                k.color(k.Color.fromHex(PALETTE.colorBrownDark)),
                k.pos(485, 100),
                k.opacity(0),
            ]);

            const socialContainer = container.add([
                k.pos(130, 0),
                k.opacity(0)
            ]);

            for (const socialData of socialsData) {
                if (socialData.name === "Email") {
                    makeEmailIcon(
                        k, 
                        socialContainer, 
                        k.vec2(socialData.pos.x, socialData.pos.y), 
                        socialData.imageData, 
                        socialData.subtitle, 
                        socialData.email
                    );
                    continue;
                }

                makeSocialIcon(
                    k, 
                    socialContainer, 
                    k.vec2(socialData.pos.x, socialData.pos.y),
                    socialData.imageData,
                    socialData.subtitle,
                    socialData.link,
                    socialData.description
                );
            }

            makeAppear(k, container);
            makeAppear(k, socialContainer);
        }
    );

    makeSection(
        k, 
        k.vec2(k.center().x - 400 , k.center().y), 
        generalData.section2Name, 
        (parent) => {
            const container = k.add([
                k.opacity(0), 
                k.pos(parent.pos.x - 300, parent.pos.y)
            ]);
            
            for (const skillData of skillsData) {
                makeSkillIcon(
                    k, 
                    container, 
                    k.vec2(skillData.pos.x, skillData.pos.y), 
                    skillData.logoData, 
                    skillData.name
                );
            }

            makeAppear(k, container);
        }
    );

    makeSection(
        k, 
        k.vec2(k.center().x + 400 , k.center().y), 
        generalData.section3Name,
        (parent) => {
            const container = parent.add([k.opacity(0), k.pos(0)]);
            for (const experienceData of experiencesData) {
                makeWorkExperienceCard(
                    k, 
                    container, 
                    k.vec2(experienceData.pos.x, experienceData.pos.y),
                    experienceData.cardHeight,
                    experienceData.roleData
                );
            }

            makeAppear(k, container);
        }
    );

    makeSection(
        k, 
        k.vec2(k.center().x, k.center().y + 400), 
        generalData.section4Name, 
        (parent) => {
            const container = parent.add([k.opacity(0), k.pos(0)]);
            for (const project of projectsData) {
                makeProjectCard(
                    k,
                    container,
                    k.vec2(project.pos.x, project.pos.y),
                    project.data,
                    project.thumbnail
                );
            }

            makeAppear(k, container);
        }
    );

    makePlayer(k, k.vec2(k.center()), 700);

}