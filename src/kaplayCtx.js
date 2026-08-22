import kaplay from "kaplay";

export default function makeKaplayCtx() {
    return kaplay({
        global: false,
        pixelDensity: 2,
        touchToMouse: true,
        debug: true, // TODO: set it to false in prod
        debugKey: "f1", // can be any key
        canvas: document.getElementById("game"),
    })
}