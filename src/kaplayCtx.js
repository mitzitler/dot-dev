import kaplay from "kaplay";

export default function makeKaplayCtx() {
    const k = kaplay({
        global: false,
        pixelDensity: 2,
        touchToMouse: true,
        debug: true, // TODO: set it to false in prod
        debugKey: "f1", // can be any key
        canvas: document.getElementById("game"),
    });

    // Kaplay binds mousedown/mouseup to the CANVAS element only. When a React modal
    // overlay covers the canvas, the press lands on the canvas but the release lands
    // on the overlay, so Kaplay never sees the mouseup and k.isMouseDown() stays stuck
    // true — the game ignores input until a throwaway click on the canvas resets it.
    // Forward any off-canvas release back to the canvas so Kaplay's mouse state stays
    // correct and control returns the instant the modal closes. (pointerup covers both
    // mouse and touch; touchToMouse means a synthetic mouseup is all Kaplay needs.)
    window.addEventListener("pointerup", (e) => {
        if (e.target !== k.canvas) {
            k.canvas.dispatchEvent(new MouseEvent("mouseup", {
                bubbles: true,
                clientX: e.clientX,
                clientY: e.clientY,
                button: e.button,
            }));
        }
    });

    return k;
}