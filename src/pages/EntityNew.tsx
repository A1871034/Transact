import { createSignal } from "solid-js";
import { invoke } from "@tauri-apps/api/core";

import { showOverlay, closeOverlay } from "../components/Overlay";

import { entities, setEntities, EntityFE } from "../pages/Entities";

export function showNewEntityOverlay() {
    const [name, setName] = createSignal("");
    const [description, setDescription] = createSignal("");

    async function submitNewEntity() {
        console.debug("submitNewEntity: ", name(), " ", description());
        await invoke("submit_new_entity", { name: name(), description: description() })
            .then((entity_id) => {
                var new_entity: EntityFE = {
                    m_id: entity_id as number,
                    m_name: name(),
                    m_description: description(),
                    m_last_transaction: "last_tx",
                    m_last_transaction_id: 0,
                    m_transactions: 0,
                    m_delta_value: 0,
                }
                setEntities(entities().concat(new_entity as never));
                closeOverlay();
            })
            .catch((err) => {
                console.log(err)
            });
    }

    const EntityNew = (
        <>
            <form onSubmit={(e) => { e.preventDefault(); submitNewEntity(); }}>
                <div>
                    <label for="name">Name:</label><br/>
                    <input
                        id="name"
                        onChange={(e) => setName(e.currentTarget.value)}
                        placeholder="Enter entity's name..."
                        required
                    />
                </div>
                <div>
                    <label for="description">Description:</label><br/>
                    <textarea
                        id="description"
                        onChange={(e) => setDescription(e.currentTarget.value)}
                        placeholder="Enter entity's description..."
                        required
                        />
                </div>
                <button type="submit">Add Entity</button>
            </form>
        </>
    )

    showOverlay("Add Entity", EntityNew);
}