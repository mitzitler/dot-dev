// Single source of truth for the current scene scale.
// buildScene() sets it once per (re)build via setScale(resizeScale(k)); every
// make* function and scroll() reads it via getScale(). This replaces the per-
// module `let SCALE` / isMobile branches that used to be copy-pasted everywhere.
let current = 2.08;

export function setScale(v) {
    current = v;
}

export function getScale() {
    return current;
}
