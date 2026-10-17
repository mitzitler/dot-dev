import { useAtom, useAtomValue } from "jotai";
import { store, isModalVisible, chosenModalDataAtom } from "../store";

export default function Modal() {
    const [isVisible, setIsVisible] = useAtom(isModalVisible);
    const data = useAtomValue(chosenModalDataAtom);
    // data may be coming from the store, not sure yet

    return (
        isVisible && (
            <div className="mod">
                <div className="mod-content">
                    <h1>{data.title}</h1>
                    {/* {data.link.length > 0 &&  
                        <a href={data.link}>{data.linkText}</a>
                    } */}
                    <p>{data.text}</p>
                    <button
                        key={data.id}
                        className="mod-btn"
                        onClick={() => {
                            store.set(isModalVisible, false);
                            setIsVisible(false);
                            // Clicking this DOM button blurs the Kaplay canvas, and
                            // Kaplay ignores keyboard/mouse input while unfocused — that's
                            // why the arrows felt dead until a "random click" on the
                            // canvas. Hand focus back so control returns immediately.
                            document.getElementById("game")?.focus({ preventScroll: true });
                        }}
                    >
                        close
                    </button>
                </div>
            </div>
        )
    )
}

// maybe a button container div