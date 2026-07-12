export async function makeAppear(k, gameObj) {
    await k.tween(gameObj.opacity, 1, 0.5, (val) => {
        gameObj.opacity = val;
        for (const child of gameObj.children) {
            child.opacity = gameObj.opacity;
        }
    }, k.easings.linear);

    if (gameObj.opacityTrickleDown) gameObj.opacityTrickleDown.cancel();
}

export function opacityTrickleDown(parent, indirectChildren) {
    parent.opacityTrickleDown = parent.onUpdate(() => {
        for (const indirectChild of indirectChildren) {
            indirectChild.opacity = parent.opacity;
        }
    });
}