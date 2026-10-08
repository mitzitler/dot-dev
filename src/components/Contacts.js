import { getScale } from "../helpers/scale.js";

// Contact button sprites are loaded once in initGame (assets are global in Kaplay).

export default function makeContacts(k, posVec2) {

    let area;

    const SCALE = getScale();
    // one standard button is 32 x 32
    const width = 156;
    const height = 32;
    area = k.add([
        k.anchor("topleft"),
        k.pos(posVec2.x - (width*SCALE/2), posVec2.y),
        k.rect(width*SCALE, height*SCALE),
        k.opacity(0)
    ])

    const RESTING = 0;
    const PRESSED = 1;

    const x_gap = 20 * SCALE; // scales with the buttons so spacing stays proportional at every size
    const midY = height * SCALE / 2;

    const btnDefs = [
        // { name: "contact_me", w: 128, isBtn: false, },
        { name: "btn-email", w:32, isBtn: true, 
            modalText: "Redirecting to your default email client...",
            link: 'mailto:mitzitler@gmail.com?subject=`Your Website is So Cool!`'
        },
        { name: "btn-github", w:32, isBtn: true,
            modalText: "Opening a new tab with my personal Github...",
            link: 'https://github.com/mitzitler/'
         },
        { name: "btn-linkedin", w:32, isBtn: true, 
            modalText: "Opening a new tab with my Linkedin page...",
            link: 'https://www.linkedin.com/in/mitzi-zitler/'
        },
    ]

    // total row width so we can center the buttons horizontally in the panel
    const rowWidth =
        btnDefs.reduce((sum, b) => sum + b.w * SCALE, 0) +
        x_gap * (btnDefs.length - 1);

    const buttons = {};
    let cursorX = (width * SCALE - rowWidth) / 2; // left edge of the first button

    for (const b of btnDefs) {
        const btn = area.add([
            k.sprite(b.name, { frame: RESTING }),
            k.scale(SCALE),
            k.anchor("left"),
            k.pos(cursorX, midY),
            k.area(),
            k.z(999),
            b.name,
        ]);

        const release = () => {
            btn.frame = RESTING;
        }
        btn.onHoverUpdate(() => {
            if (k.isMouseDown() && b.isBtn) {
                btn.frame = PRESSED;
                console.log("link for button: ", b.name, ", ", b.link);
                window.open(b.link, '_blank')
                // open link
                // perhaps show a modal
            } else {
                release();
            }
        })

        btn.onHoverEnd(release);
        buttons[b.name] = btn;
        cursorX += b.w * SCALE + x_gap;
    }

    return area;

}