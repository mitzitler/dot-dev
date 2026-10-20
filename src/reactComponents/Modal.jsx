import TextModal from "./TextModal";
import InputModal from "./InputModal";

// Parent/container for every modal flavor. Each child reads its own
// visibility atom from the store and renders only when it should, so this
// just groups them in one place. Add new modal types here as they appear.
export default function Modal() {
    return (
        <>
            <TextModal />
            <InputModal />
        </>
    );
}
