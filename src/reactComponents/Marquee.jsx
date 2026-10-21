import { useLayoutEffect, useRef, useState } from "react";

const SPEED = 60;

export default function Marquee({ dir, msg }) {
    const measureRef = useRef(null);
    const [reps, setReps] = useState(1);
    const [duration, setDuration] = useState(60);

    useLayoutEffect(() => {
        const measure = () => {
            const oneMsg = measureRef.current.offsetWidth;
            const n = Math.max(1, Math.ceil(window.innerWidth / oneMsg));
            setReps(n);
            setDuration((oneMsg * n) / SPEED);
        };
        measure();
        window.addEventListener("resize", measure);
        return () => window.removeEventListener("resize", measure);
    }, [msg])

    const pos = dir === "top" ? "top" : "btm";
    const copy = msg.repeat(reps);
    return (
        <div className={`marquee-container ${pos}`}>
            <span ref={measureRef} className="marquee" 
                style={{ position: "absolute", visibility: "hidden" }}>
                {msg}
            </span>
            <div className="marquee-track" style={{ "--marquee-dur": `${duration}s`}}>
                <p className={`marquee ${pos}`}>{copy}</p>
                <p className={`marquee ${pos}`} aria-hidden="true">{copy}</p>
            </div>
        </div>
    );
}