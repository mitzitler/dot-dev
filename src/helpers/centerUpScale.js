// Reveals (or hides) an entity by growing (or shrinking) its VERTICAL scale
// between 0 and its full scale, outward from its own center. The entity must be
// anchored "center" so it opens up and down simultaneously, like a blind.
//
// Unlike a stencil mask, this touches no opacity and needs no nested masking —
// so an entity revealed this way still clips cleanly to any ancestor mask.
// scale.x is left untouched; only scale.y animates.
export default async function centerUpScale(k, entity, fullScaleY, duration, appear = true) {
    const from = appear ? 0 : fullScaleY;
    const to = appear ? fullScaleY : 0;

    entity.scale.y = from;

    await k.tween(from, to, duration, (sy) => {
        entity.scale.y = sy;
    }, k.easings.linear);

    return entity;
}
