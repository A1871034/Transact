import { showOverlay } from "../components/Overlay";

export function showEntityOverlay(entity_id: number) {
    const Entity = (
        <>
            <h2>ID: {entity_id}</h2>
        </>
    )

    showOverlay("Work", Entity);
}