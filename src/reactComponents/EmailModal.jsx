import { useAtom, useAtomValue } from "jotai";
import { emailAtom, isEmailModalVisibleAtom } from "../store";
import { useState } from "react";

export default function EmailModal() {
    const [isVisible, setIsVisible] = useAtom(isEmailModalVisibleAtom);
    const email = useAtomValue(emailAtom);
    
    const [onCopyMessage, setOnCopyMessage] = useState("");

    const buttons = [
        { 
            id: 0,
            name: "Yes",
            handler: () => {
                navigator.clipboard.writeText(email);
                setOnCopyMessage("Email copied to clipboard!");
            },
        },
        { 
            id: 1,
            name: "No",
            handler: () => {
                setIsVisible(false);
            },
        },
    ];

    return (
        isVisible && (
            <div className="modal">
                <div className="modal-content">
                    <h1>Copy my email to your clipboard?</h1>
                    <span>{email}</span>
                    <p>{onCopyMessage}</p>
                    <div className="modal-btn-container">
                        {buttons.map((btn) => (
                            <button
                                key={btn.id}
                                className={"modal-btn"}
                                onClick={btn.handler}
                            >
                                {btn.name}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        )
    )

}