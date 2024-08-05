import '../styles/Overlay.css'

import { createSignal } from 'solid-js';

const [overlayContent, setOverlayContent] = createSignal(<></>)
const [label, setLabel] = createSignal("");

function closeOverlay() {
    console.debug("closing overlay");
    document.getElementById("overlay")?.setAttribute("hidden", "");
    document.removeEventListener("keyup", overlayEscapeClose)
    setOverlayContent(<></>);
}

function overlayEscapeClose(e: any) {
    if (e.key !== "Escape") { return; }
    if (e.target?.nodeName === "INPUT") { return; }
    
    closeOverlay();
}

function showOverlay(label: string, elements: any) {
    console.debug(`showing overlay \"${label}\"`);
    setOverlayContent(elements);
    setLabel(label);
    document.removeEventListener("keyup", overlayEscapeClose)
    document.addEventListener("keyup", overlayEscapeClose);
    document.getElementById("overlay")?.removeAttribute("hidden");
}

function Overlay() {
    /* Currently bugged in that if pressing on an element 
     and dragging to outside before releasing
     the overlay will close, unsure how to fix
     initial attempts unsuccessful with trying to stop propagation
     as opposed to current method of catching the propagation
     */
    function pressedElementClose(this: any, e: any) {
        if (e.target !== e.currentTarget) {
            return;
        }
        closeOverlay();
    }

    const [maxMinSrc, setMaxMinSrc] = createSignal("/icons/expand-solid.svg");
    function toggleMaximise() {
        let d = document.getElementById("overlay-page");

        if (d?.className === "maximised") {
            d.className = "";
            setMaxMinSrc("/icons/expand-solid.svg");
        } else if (d) {
            d.className = "maximised";
            setMaxMinSrc("/icons/compress-solid.svg");
        }
    }
    
    return (
        <>
            <div id="overlay" onclick={(e) => {pressedElementClose(e)}} hidden>
                <div id="overlay-page">
                    <div id="overlay-banner">
                        <p><b>{label()}</b></p>
                        <div id="overlay-window-controls">
                            <img src={maxMinSrc()} id="close-x" class="icon interactive" onclick={toggleMaximise} draggable="false"/>
                            <img src="/icons/xmark-solid.svg" id="close-x" class="icon interactive" onclick={closeOverlay} draggable="false"/>
                        </div>
                    </div>
                    <div id="overlay-content">
                        {overlayContent()}
                    </div>
                </div>
            </div>
        </>
    )
}

export { Overlay, showOverlay };