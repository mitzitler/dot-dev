import { getScale } from "../helpers/scale.js";
import { store, isModalVisible, chosenModalDataAtom } from "../store";

// Contact button sprites are loaded once in initGame (assets are global in Kaplay).

export default async function makeContacts(k, posVec2) {

    const modalData = await( await fetch('./configs/modalData.json')).json();

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

    // switch out data ref later

    const btnDefs = [
        { name: "btn-email", w:32, isBtn: true,
            modalText: "Redirecting to your default email client...",
            link: 'mailto:mitzitler@gmail.com?subject=`Your Website is So Cool!`',
            data: modalData[0],
        },
        { name: "btn-github", w:32, isBtn: true,
            modalText: "Opening a new tab with my personal Github...",
            link: 'https://github.com/mitzitler/',
            data: modalData[1],
         },
        { name: "btn-linkedin", w:32, isBtn: true, 
            modalText: "Opening a new tab with my Linkedin page...",
            link: 'https://www.linkedin.com/in/mitzi-zitler/',
            data: modalData[2],
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

        // Open the modal on the PRESS EDGE (not every frame it's held). Opening the
        // React modal mounts a full-screen overlay that steals the mouse-up from the
        // Kaplay canvas, so k.isMouseDown() gets stuck true. A per-frame "while down"
        // handler would then re-assert isModalVisible=true forever and the modal's
        // close button could never win. Firing once per press means a stuck-down
        // mouse produces no new edge, so close sticks.
        let wasDown = false;
        btn.onHoverUpdate(() => {
            const down = k.isMouseDown() && b.isBtn;
            if (down && !wasDown) {
                btn.frame = PRESSED;
                if (b.name != "btn-email")
                    window.open(b.link, '_blank')
                store.set(chosenModalDataAtom, b.data)
                store.set(isModalVisible, true);
            } else if (!down) {
                release();
            }
            wasDown = down;
        })

        btn.onHoverEnd(() => {
            release();
            wasDown = false;
        });
        buttons[b.name] = btn;
        cursorX += b.w * SCALE + x_gap;
    }

    return area;

}