import { invoke } from "@tauri-apps/api/core";
import { createSignal, For } from "solid-js";

// import { database_time_to_string } from "../Utils";
import { ItemFE } from "../FrontEndTypes";
import { showNewItemOverlay } from "./ItemNew";
import { showItemOverlay } from "./Item";

export const [items, setItems] = createSignal<Array<ItemFE>>();
async function get_items() {
    // Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
    setItems(await invoke("get_items"));
    console.debug("received items: ", items());
}

function Items() {
    get_items();
    return (
    <>
        <h2>Would be nice to have a good fuzzy search bar here</h2>
        <table class="dashboard-item interactive">
            <colgroup>
                <col span="1" style="width: 30%;" />
                <col span="1" style="width: 40%;" />
                <col span="1" style="width: 10%;" />
                <col span="1" style="width: 20%;" />
            </colgroup>
            <thead>
                <tr class="table-header-row">
                    <th>Name</th>
                    <th>Brand</th>
                    <th>Description</th>
                    <th>Leaf Category</th>
                </tr>
            </thead>
            <tbody>
                <For each={items()}>
                {(item:ItemFE, _) => (
                    <tr onclick={() => {showItemOverlay(item.m_id)}}>
                        <td>{item.m_name}</td>
                        <td>{item.m_brand}</td>
                        <td>{(item.m_description.length > 47) ? item.m_description.slice(0, 47).trimEnd() + "..." : item.m_description}</td>
                        <td>Unimplemented</td>
                    </tr>
                )}
                </For>
            </tbody>
        </table>
        <button class="abs-br" onclick={showNewItemOverlay}>
            <img src="/icons/plus-solid.svg" draggable="false"/>
        </button>
    </>
    )
}

export default Items;