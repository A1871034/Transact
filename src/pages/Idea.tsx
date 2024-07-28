import { showOverlay } from "../components/Overlay";

export function showIdeaPopup(idea_id: number) {
    const Idea = (
        <>
            <h2>ID: {idea_id}</h2>
        </>
    )

    showOverlay("Payslip", Idea);
}