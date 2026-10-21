import Modal from "./reactComponents/Modal";
import Marquee from "./reactComponents/Marquee";
import { getMessages } from "./helpers/guestbookApi";
import { useEffect, useState } from "react";
import { useAtomValue } from "jotai";
import { loadSequenceFinished } from "./store";

let DEFAULT_MSG = "MITZI SAYS 'HI :-)' * "

// how often the marquee re-checks the guestbook for new messages
const POLL_MS = 30_000;

export async function formatMessages() {
    // backend wraps the list: { marqueemessages: [...] }
    const { marqueemessages } = await getMessages();
    // Redis HGetAll order is arbitrary and changes between calls; sort so each
    // poll produces the same string and the marquee doesn't jump for no reason
    const sorted = [...marqueemessages].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    return DEFAULT_MSG + sorted
        .map(m => `${m.name.toUpperCase()} SAYS '${m.msg.toUpperCase()}' * `).join("");
}

export default function ReactUI() {
    const [msg, setMsg] = useState(DEFAULT_MSG + DEFAULT_MSG + DEFAULT_MSG);
    const loaded = useAtomValue(loadSequenceFinished);

    useEffect(() => {
        const refresh = () => formatMessages().then(setMsg).catch(err => console.error("marquee refresh failed:", err));
        refresh();
        const id = setInterval(refresh, POLL_MS);
        return () => clearInterval(id);
    }, [])

    return (
        <>
            {loaded && <Marquee dir="top" msg={msg}/>}
                <Modal />
            {loaded && <Marquee dir="btm" msg={msg}/>}
        </>
    );
}
