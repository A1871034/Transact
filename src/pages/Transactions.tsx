import { invoke } from "@tauri-apps/api/core";
import { createSignal, For } from "solid-js";

import { showTransactionOverlay } from "./Transaction";
import { showTransferOverlay } from "./Transfer";

interface TransactionFE {
    m_id: number,
    m_name: string,
    m_description: string,
    m_closed: boolean,
    m_count_transactions: number,
    m_latest_transaction_datetime: string,
    m_latest_transaction_id: number,
    m_created: string,
}
const [transactions, setTransactions] = createSignal([]);
async function get_transactions() {
    // Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
    setTransactions(await invoke("get_transactions"));
    console.debug("received transactions: ", transactions());
}

function Transactions() {
    get_transactions();
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
            <thead>
                <tr class="table-header-row">
                    <th>Transaction</th>
                    <th>Description</th>
                    <th>Status</th>
                    <th>Transfers</th>
                    <th>Last Transfer</th>
                    <th>Created</th>
                </tr>
            </thead>
            <tbody>
                <For each={transactions()}>
                {(item:TransactionFE, index) => (
                    <tr onclick={() => {showTransactionOverlay(item.m_id + index())}}>
                        <td>{item.m_name}</td>
                        <td>{(item.m_description.length > 47) ? item.m_description.slice(0, 47).trimEnd() + "..." : item.m_description}</td>
                        <td>{item.m_closed ? "closed" : "open"}</td>
                        <td>{item.m_count_transactions}</td>
                        <td><span onclick={(e) => {e.stopPropagation(); showTransferOverlay(item.m_latest_transaction_id + index())}} class="interactive">{item.m_latest_transaction_datetime}</span></td>
                        <td>{item.m_created}</td>
                    </tr>
                )}
                </For>
            </tbody>
        </table>
        <h2>TODO:</h2>
        <p>Table is sorted open -&gt; last_transaction -&gt; create</p>
        <p>Create Transaction button -&gt; overlay</p>
    </>
    )
}

export default Transactions;