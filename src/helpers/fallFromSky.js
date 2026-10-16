import { PARALLAX_WIDTH } from "../constants";
import { getScale } from "./scale.js";

const skillsDefs = [
    { name: "btn-cpp", w: 32, isBtn: true },
    { name: "btn-databricks", w: 32, isBtn: true },
    { name: "btn-java", w: 32, isBtn: true },
    { name: "btn-python", w: 32, isBtn: true },
    { name: "btn-react", w: 32, isBtn: true },
    { name: "btn-svelte", w: 32, isBtn: true },
    { name: "btn-typescript", w: 32, isBtn: true },
]

function randomX(k) {
    // this way it can only appear between 60 to 260 px 
    // from center in either direction

    let x = k.rand(300) + 60;
    // k.randi(0,1) is Math.floor(rand(0,1)) === always 0, so the old check
    // always negated x (always left). choose() picks a real -1 or +1.
    x *= k.choose([-1, 1]);
    return x;
}

export function fallFromSky(k, mask) {
    
    let SCALE = getScale();

    let skillDef = k.choose(skillsDefs);
    let skill = skillDef.name;
    // let skill = "btn-cpp";
    let someTopMargin = 150;

    const RESTING = 0;
    const PRESSED = 1;

    let x = randomX(k);

    let skillEntity = mask.add([
        k.sprite(skill, { frame: RESTING }),
        k.pos((PARALLAX_WIDTH * SCALE) / 2 + x, -1 * someTopMargin),
        k.body(),
        k.area({ collisionIgnore: ["girlie"], offset: k.vec2(0, -5) }),
        k.anchor("center"),
        k.scale(SCALE),
        k.z(9999),

        skill,     // sprite-name tag (e.g. "btn-cpp")
        "skill",   // shared tag so skills can detect collisions with each other
    ])

    // Bounce: each time the block lands on the ground, launch it back up with a
    // force that decays, so it bounces a few times and then settles. onCollide
    // fires once per landing (each new contact after it has left the ground).
    let bounceForce = 250;
    skillEntity.onCollide("ground", () => {
        if (bounceForce < 40) return; // too weak to matter — let it rest
        skillEntity.jump(bounceForce);
        bounceForce *= 0.5;
    });

    // Bounce off OTHER skills instead of sliding/stacking. The body resolver only
    // pushes overlapping bodies apart (a slide); to bounce we reflect this skill's
    // velocity about the contact normal (flips the component heading into the other
    // skill, keeps the tangential part) and damp it with a restitution factor.
    const RESTITUTION = 0.6;
    skillEntity.onCollide("skill", (_other, col) => {
        if (!col) return;
        skillEntity.vel = skillEntity.vel.reflect(col.normal).scale(RESTITUTION);
    });

    // Same press/resting behavior as the Controls buttons: pressed frame while the
    // mouse is held over it, resting frame otherwise (and on hover-end).
    const release = () => {
        skillEntity.frame = RESTING;
    };
    skillEntity.onHover(() => {
        skillEntity.frame = PRESSED;
    });
    skillEntity.onHoverEnd(release);

    return skillEntity;

}