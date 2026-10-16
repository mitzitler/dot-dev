import { PALETTE, PARALLAX_HEIGHT, PARALLAX_WIDTH, DIST_FROM_CENTER_TO_GROUND_HEIGHT, CONTACTS_Y_OFFSET, CONTACTS_Y_OFFSET_BOT, SCALE_REFERENCE } from "./constants";
import makeKaplayCtx from "./kaplayCtx";
import makeGirlie from "./entities/Girlie";
import { makeGround } from "./entities/Ground.js";
import makeBackground, { GROUND_SPEED, attachToScroll } from "./entities/Bg";
import makeLightbulb from "./entities/Lightbulb";
import { fallFromSky } from "./helpers/fallFromSky.js";
// import makeFlower from "./entities/Flower";
import makeContacts from "./components/Contacts.js";
import makeControls from "./components/Controls";
import startLoadSequence from "./helpers/loadSequence";
import resizeScale from "./helpers/resizeScale";
import { setScale, getScale } from "./helpers/scale.js";
import { loadSprites } from "./helpers/loadSprites.js";
import { makeMarquee } from "./components/Marquee.js";

export default async function initGame() {

    // const generalData = await( await fetch('./configs/generalData.json')).json();
    // const socialsData = await( await fetch('./configs/socialsData.json')).json();
    // const skillsData = await( await fetch('./configs/skillsData.json')).json();
    // const experiencesData = await( await fetch('./configs/experiencesData.json')).json();
    // const projectsData = await( await fetch('./configs/projectsData.json')).json();
    const toolboxData = await( await fetch('./configs/toolBoxTexts.json')).json();

    const k = makeKaplayCtx();
    k.setGravity(200);

    // ---- one-time asset loading ----
    // Assets are global in Kaplay and survive scene switches, so load everything
    // ONCE here (not inside buildScene, which re-runs on every resize).
    loadSprites(k);

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
        let botLeftY = k.center().y + (PARALLAX_HEIGHT*SCALE/2);

        const mask = k.add([
            k.pos(topLeftX, topLeftY),
            k.rect(PARALLAX_WIDTH*SCALE, PARALLAX_HEIGHT*SCALE), // Size of the masked clipping area
            k.mask("intersect"),
        ]);

        makeBackground(k, mask);

        // Touch controls only — desktop is keyboard-driven.
        if (k.isTouchscreen()) {
            makeControls(k, k.vec2(k.center().x, topLeftY+((30+PARALLAX_HEIGHT)*SCALE)));
            makeContacts(k, k.vec2(k.center().x, topLeftY-(CONTACTS_Y_OFFSET*SCALE)));
        } else {
            makeContacts(k, k.vec2(k.center().x, botLeftY+(CONTACTS_Y_OFFSET_BOT*SCALE)));
        }

        makeMarquee(k, k.vec2(0+(10*SCALE), 0+(1*SCALE)), "marquee1", "topleft");
        makeMarquee(k, k.vec2(0+(10*SCALE), k.height()-(1*SCALE)), "marquee2", "botleft");

        makeGround(k);

        let girlie = makeGirlie(
            k,
            mask,
            // mask-local: horizontal center of the scene, at the shared ground line
            // (same derivation the bulbs use). Gravity settles her onto the ground.
            k.vec2(
                (PARALLAX_WIDTH * SCALE) / 2,
                (PARALLAX_HEIGHT * SCALE) / 2 + SCALE * DIST_FROM_CENTER_TO_GROUND_HEIGHT
            ),
            30
        );

        // this needs to be quarantined better
        // Offsets from the parallax center. They were hand-tuned as pixels at the
        // reference (old desktop) scale, so multiply by SCALE/SCALE_REFERENCE to
        // keep that exact placement on desktop while staying on the ground when
        // zoomed in on mobile (an unscaled +150/+75 drifts off at other scales).
        const offsetScale = SCALE / SCALE_REFERENCE;
        let lbY = ((PARALLAX_HEIGHT * SCALE) / 2) + 75 * offsetScale;
        let lb1 = makeLightbulb(
            k,
            mask,
            k.vec2(
                ((PARALLAX_WIDTH * SCALE) / 2) + 200 * offsetScale, lbY
            ),
            toolboxData[0],
        )
        lb1.id = "about-me";
        attachToScroll(lb1, GROUND_SPEED);

        let lb2 = makeLightbulb(
            k,
            mask,
            k.vec2(
                ((PARALLAX_WIDTH * SCALE) / 2) + (-450) * offsetScale, lbY
            ),
            toolboxData[1]
        )
        lb2.id = "contact-me";
        attachToScroll(lb2, GROUND_SPEED);

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

        k.onKeyPress("s", () => {
            attachToScroll(fallFromSky(k, mask));
        })
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
