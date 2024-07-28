import '../styles/Overlay.css'

import { createSignal } from 'solid-js';


function Overlay(props: any) {
    const [overlayContent, setOverlayContent] = createSignal(<></>)
    function closeOverlay() {
        setOverlayContent(<></>);
    }
    const overlay = (children: any) => (
        <>
            <div id="overlay">
                <div id="overlay-content">
                    <button onclick={() => {closeOverlay()}}>Close</button>
                    {children}
                </div>
            </div>
        </>
    )
    function showOverlay() {
        console.log(props);
        setOverlayContent(overlay(props));
    }
    
    return [(
        <>
            {overlayContent()}
        </>
    ), showOverlay]
}

export default Overlay;