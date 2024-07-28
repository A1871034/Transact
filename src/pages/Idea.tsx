import { createSignal } from "solid-js";
import { render } from "solid-js/web";
import Overlay from "../components/Overlay";

const [ideaId, setIdeaId] = createSignal(-1);

const idea = (
    <>
        <h1 style="background-color:var(--primary-color)">IDEA</h1>
        <h2>ID: {ideaId()}</h2>
    </>
)
const [overlayComponent, showOverlay] = Overlay(idea);

function showIdeaPopup(idea_id: number) {
    setIdeaId(idea_id);
    showOverlay();
}

function Idea() {
    return (
    <>
        {overlayComponent}
    </>
    )
}

export { 
    Idea,
    showIdeaPopup
 };