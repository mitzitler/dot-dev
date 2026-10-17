import { PARALLAX_HEIGHT, DIST_FROM_CENTER_TO_GROUND_HEIGHT  } from "../constants";
import { getScale } from "../helpers/scale.js";
import { store, isAnyModalVisibleAtom } from "../store";
import makeTooltipBox from "../components/TooltipBox";

export default function makeLightbulb(k, mask, posVec2, tooltipdata) {
    // this has k.anchor(), k.area(), k.body(), k.pos(), k.sprite - with default anim

    const SCALE = getScale();

    let lightbulb = mask.add([
        k.sprite("lightbulb", {anim: "off"}),
        // k.scale(lightbulbScale),
        k.scale(SCALE),
        k.anchor("center"),
        // if this uses a shape for area, make sure its relative to itself, not to the canvas
        // k.area(), 
        // k.body(),
        k.pos(posVec2),
        k.z(990),
        "lightbulb",
        // custom vars
        {
            isOn: false, 
            id: "",
        },
    ]);

    // Width (in sprite-frame px) of the trigger column. The visible bulb art is
    // ~28px wide inside the 40px frame; keep the hitbox to the art, not the frame.
    const TRIGGER_W = 30;

    // Height (in sprite-frame px) of the tight CLICK box on the bulb itself. The
    // visible bulb art is ~28x36 inside the 40px frame, roughly centered.
    const CLICK_W = 30;
    const CLICK_H = 38;

    // The bulb's OWN area is a tight box around the visible bulb — this is the
    // click target (turn off), and keeping it tight means the whole bulb is
    // clickable (the old column's top started at the bulb's center, leaving the
    // upper half unclickable, which felt like needing a double-click).
    lightbulb.use(k.area());

    // Girlie walks along the GROUND, below the floating bulb, so she can't reach a
    // tight bulb hitbox. A separate invisible child carries the tall trigger column
    // (bulb center down to the ground) and detects her. It's a child of the bulb so
    // it inherits the bulb's scale/position and scrolls along with it.
    const trigger = lightbulb.add([
        k.anchor("center"),
        k.pos(0, 0),
        k.area(),
        "bulb-trigger",
    ]);

    // Both shapes depend on the sprite's loaded size/position, and a sprite comp
    // starts at 0 until its (async) asset loads — so defer to onLoad (fires
    // immediately if already loaded) so the hitboxes are identical on every build.
    k.getSprite("lightbulb").onLoad(() => {
        // Tight click box, centered on the bulb (Rect pos (0,0) + kaplay's center
        // anchor shift → spans ±CLICK_W/2, ±CLICK_H/2 around the bulb).
        lightbulb.area.shape = new k.Rect(k.vec2(0, 0), CLICK_W, CLICK_H);

        // Trigger column: ground line in mask-local space (same derivation as
        // girlie's spawn), converted back into frame px (÷ the bulb's scale). Rect
        // pos (0, H/2) puts its TOP at the bulb center, growing downward.
        //
        // The column doesn't need to reach the ground: girlie's hitbox is her full
        // (tall) frame and reaches up near the bulb, so only the upper part of the
        // bulb→ground drop does any work. COLUMN_REACH keeps that top fraction.
        const COLUMN_REACH = 0.4; // 0..1 of the bulb→ground distance; lower = shorter
        const groundLocalY = (PARALLAX_HEIGHT * SCALE) / 2 + SCALE * DIST_FROM_CENTER_TO_GROUND_HEIGHT;
        const columnH = ((groundLocalY - lightbulb.pos.y) / SCALE) * COLUMN_REACH;
        trigger.area.shape = new k.Rect(k.vec2(0, columnH / 2), TRIGGER_W, columnH);
    });

    let tooltipBox;

    // The first time girlie reaches the bulb (via the trigger column), light it and
    // reveal its tooltip. Same for every bulb; only `tooltipdata` differs.
    trigger.onCollide("girlie", () => {
        if (lightbulb.isOn) return;
        lightbulb.isOn = true;

        lightbulb.play("lighting");
        lightbulb.onAnimEnd(anim => {
            if (anim === "lighting") {
                lightbulb.play("on");
                lightbulb.stop();
            }
        });

        const topCenter = k.vec2(0, -lightbulb.height / 2);
        // makeTooltipBox is async (it waits, then types the text in), so it returns
        // a Promise — capture the resolved box so onClick can destroy it. If the
        // bulb was clicked off before the reveal finished, discard the box instead.
        makeTooltipBox(k, lightbulb, topCenter, tooltipdata, 2.5).then(box => {
            if (!lightbulb.isOn) { box.destroy(); return; }
            tooltipBox = box;
        });
    });

    // If the bulb is already lit (e.g. state carried into a resize rebuild),
    // show it in its final "on" state rather than replaying the animation.
    if (lightbulb.isOn) {
        lightbulb.play("on");
        lightbulb.stop();
    }

    // Click a lit bulb to turn it off and remove its tooltip. Resetting isOn lets
    // it be re-lit the next time girlie reaches it, and guards against a second
    // click destroying an already-gone tooltip.
    lightbulb.onClick(() => {
        if (!lightbulb.isOn) return;
        lightbulb.isOn = false;

        lightbulb.play("turning_off");
        // lightbulb.play("off");
        if (tooltipBox) {
            k.wait(1.5, () => {
                    tooltipBox.destroy();
                    tooltipBox = null;
                }
            )
        }
    });

    // Drive this bulb's focus from React, same as the background (see Bg.js).
    // While ANY modal is open the bulb is "out of focus": it freezes on the sepia
    // frame 6 regardless of on/off, and that supersedes whatever animation was
    // playing. When the modal closes it resumes exactly what it was doing — the
    // animation it was mid-way through, or the static frame it was resting on.
    //
    // The subscription is PER BULB (not a shared module var): there are several
    // bulbs, so a single shared unsub would let each new bulb tear down the
    // previous one's subscription. Clean up on destroy instead — the scene is
    // rebuilt on resize, which destroys these and fires onDestroy, so no leak.
    const UNFOCUS_FRAME = 6;
    let frozen = false;      // true while held on the unfocus frame
    let savedAnim = null;    // anim that was playing when we froze (undefined if none)
    let savedFrame = 0;      // frame it was resting on, for the no-anim case

    const syncFocus = () => {
        if (store.get(isAnyModalVisibleAtom)) {
            // Remember what to resume, but only on the transition INTO unfocus so a
            // repeated fire doesn't overwrite the saved state with the sepia frame.
            if (!frozen) {
                savedAnim = lightbulb.curAnim();
                savedFrame = lightbulb.frame;
                frozen = true;
            }
            lightbulb.stop();              // keep the anim system from touching the frame
            lightbulb.frame = UNFOCUS_FRAME;
        } else if (frozen) {
            // Back in focus: resume the prior animation, or the prior static frame.
            if (savedAnim) lightbulb.play(savedAnim);
            else lightbulb.frame = savedFrame;
            frozen = false;
        }
    };
    const unsubFocus = store.sub(isAnyModalVisibleAtom, syncFocus);
    lightbulb.onDestroy(() => unsubFocus());
    syncFocus();



    return lightbulb;


}