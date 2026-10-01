// Reveals (or hides) a mask entity by growing (or shrinking) its clip
// height outward from its own vertical center, up and down simultaneously.
// The masked child (e.g. a sprite) is always rendered at its real, correct
// scale - only how much of it shows through the mask changes.
export default async function centerUpLoad(k, maskEntity, fullHeight, duration, appear = true) {
    const from = appear ? 0 : fullHeight;
    const to = appear ? fullHeight : 0;

    await k.tween(from, to, duration, (height) => {
        maskEntity.height = height;
    }, k.easings.linear);

    return maskEntity;
}
