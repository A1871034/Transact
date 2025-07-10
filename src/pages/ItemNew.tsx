import { invoke } from "@tauri-apps/api/core";
import { createSignal } from "solid-js";

import { showOverlay, closeOverlay } from "../components/Overlay";
import { ItemFE } from "../FrontEndTypes";

import { items, setItems } from "./Items";
import { get_time_as_if_database } from "../Utils";

export function showNewItemOverlay() {
    const [name, setName] = createSignal("");
    const [description, setDescription] = createSignal("");

    async function submitNewItem() {
        console.debug("submitNewItem: ", name(), " ", description());
        await invoke<number>("submit_new_item", { name: name(), description: description() })
            .then((item_id: number) => {
                console.log("New item created with id " + item_id)
                var new_item: ItemFE = {
                    m_id: item_id,
                    m_name: name(),
                    m_description: description(),
                    m_created: get_time_as_if_database(), 
                }
                setItems(items()?.concat(new_item as never));
                closeOverlay();
            })
            .catch((err) => {
                console.log(err)
            });
    }

    const ItemNew = (
        <>
            <form onSubmit={(e) => { e.preventDefault(); submitNewItem(); }}>
                <div>
                    <label for="name">Name:</label><br/>
                    <input
                        id="name"
                        onChange={(e) => setName(e.currentTarget.value)}
                        placeholder="Enter item's name..."
                        required
                    />
                </div>
                <div>
                    <label for="description">Description:</label><br/>
                    <textarea
                        id="description"
                        onChange={(e) => setDescription(e.currentTarget.value)}
                        placeholder="Enter item's description..."
                        required
                        />
                </div>
                <button type="submit">Add Item</button>
            </form>
        </>
    )

    showOverlay("Add Item", ItemNew);
}