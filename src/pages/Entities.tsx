import { invoke } from "@tauri-apps/api/tauri";
import { createSignal, For } from "solid-js";

import { showEntityOverlay } from "./Entity";
import { showNewEntityOverlay } from "./EntityNew";
import { showTransactionOverlay } from "./Transaction";

interface EntityFE {
    m_id: number,
    m_name: string,
    m_description: string,
    m_last_transaction: string,
    m_last_transaction_id: number,
    m_transactions: number,
    m_delta_value: number,
}
const [entity, setEntities] = createSignal([]);
async function get_ideas() {
    // Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
    setEntities(await invoke("get_entities"));
    console.debug("received entities: ", entity());
}

function Ideas() {
    get_ideas();
    return (
    <>
        <table class="dashboard-item interactive">
            <colgroup>
                <col span="1" style="width: 17%;" />
                <col span="1" style="width: 33%;" />
                <col span="1" style="width: 10%;" />
                <col span="1" style="width: 10%;" />
                <col span="1" style="width: 17%;" />
                <col span="1" style="width: 17%;" />
            </colgroup>
            <tbody>
                <tr class="table-header-row">
                    <th>Name</th>
                    <th>Description</th>
                    <th>Last Transaction</th>
                    <th>Delta Value</th>
                    <th>Transactions</th>
                </tr>
                <For each={entity()}>
                {(item:EntityFE, index) => (
                    <tr onclick={() => {showEntityOverlay(item.m_id + index())}}>
                        <td>{item.m_name}</td>
                        <td>{(item.m_description.length > 47) ? item.m_description.slice(0, 47).trimEnd() + "..." : item.m_description}</td>
                        <td><span onclick={(e) => {e.stopPropagation(); showTransactionOverlay(item.m_last_transaction_id + index())}} class="interactive">{item.m_last_transaction}</span></td>
                        <td>{item.m_delta_value}</td>
                        <td>{item.m_transactions}</td>
                    </tr>
                )}
                </For>
            </tbody>
        </table>
        <button onclick={showNewEntityOverlay}>
            <img src="/icons/plus-solid.svg" draggable="false"/>
        </button>
    </>
    )
}

export default Ideas;