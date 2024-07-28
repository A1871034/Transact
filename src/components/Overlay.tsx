import '../styles/Overlay.css'

import { createSignal } from 'solid-js';

const [overlayContent, setOverlayContent] = createSignal(<></>)
const [label, setLabel] = createSignal("");

function closeOverlay() {
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
    setOverlayContent(elements);
    setLabel(label);
    document.removeEventListener("keyup", overlayEscapeClose)
    document.addEventListener("keyup", overlayEscapeClose);
    document.getElementById("overlay")?.removeAttribute("hidden");
}

function Overlay() {
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
                            <img src={maxMinSrc()} id="close-x" class="icon interactive" onclick={toggleMaximise}/>
                            <img src="/icons/xmark-solid.svg" id="close-x" class="icon interactive" onclick={closeOverlay}/>
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