import { invoke } from "@tauri-apps/api/tauri";
import { createSignal, For } from "solid-js";

import { showIdeaOverlay } from "./Idea";
import { showTransactionOverlay } from "./Transaction";

interface IdeaFE {
    m_id: number,
    m_name: string,
    m_description: string,
    m_closed: boolean,
    m_count_transactions: number,
    m_latest_transaction_datetime: string,
    m_latest_transaction_id: number,
    m_created: string,
}
const [ideas, setIdeas] = createSignal([]);
async function get_ideas() {
    // Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
    setIdeas(await invoke("get_ideas"));
    console.debug("received ideas: ", ideas());
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
                    <th>Idea</th>
                    <th>Description</th>
                    <th>Status</th>
                    <th>Transactions</th>
                    <th>Last Transaction</th>
                    <th>Created</th>
                </tr>
                <For each={ideas()}>
                {(item:IdeaFE, index) => (
                    <tr onclick={() => {showIdeaOverlay(item.m_id + index())}}>
                        <td>{item.m_name}</td>
                        <td>{(item.m_description.length > 47) ? item.m_description.slice(0, 47).trimEnd() + "..." : item.m_description}</td>
                        <td>{item.m_closed ? "closed" : "open"}</td>
                        <td>{item.m_count_transactions}</td>
                        <td><span onclick={(e) => {e.stopPropagation(); showTransactionOverlay(item.m_latest_transaction_id + index())}} class="interactive">{item.m_latest_transaction_datetime}</span></td>
                        <td>{item.m_created}</td>
                    </tr>
                )}
                </For>
            </tbody>
        </table>
        <h2>TODO:</h2>
        <p>Table is sorted open -&gt; last_transaction -&gt; create</p>
        <p>Create Idea button -&gt; overlay</p>
    </>
    )
}

export default Ideas;