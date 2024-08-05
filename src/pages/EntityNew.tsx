import { createSignal } from "solid-js";
import { invoke } from "@tauri-apps/api/tauri";

import { showOverlay } from "../components/Overlay";

export function showNewEntityOverlay() {
    const [name, setName] = createSignal("");
    const [description, setDescription] = createSignal("");

    async function submitNewEntity() {
        console.log(name(), " ", description());
        var success = await invoke("submit_new_entity", { name: name(), description: description() });
        console.log(success ? "Submission Successful" : "Submission Failed");
    }

    const EntityNew = (
        <>
            <form onSubmit={(e) => { e.preventDefault(); submitNewEntity(); }}>
                <label for="name">Name:</label><br/>
                <input
                    id="name"
                    onChange={(e) => setName(e.currentTarget.value)}
                    placeholder="Enter entity's name..."
                    required
                /><br/>
                <label for="description">Description:</label><br/>
                <textarea
                    id="description"
                    onChange={(e) => setDescription(e.currentTarget.value)}
                    placeholder="Enter entity's description..."
                    required
                /><br/>
                <button type="submit">Add Entity</button>
            </form>
        </>
    )

    showOverlay("Add Entity", EntityNew);
}