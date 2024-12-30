import { invoke } from "@tauri-apps/api/tauri";
import { createSignal, For } from "solid-js";

import { showIdeaOverlay } from "./Idea";
import { showEntityOverlay } from "./Entity";
import { showTransactionOverlay } from "./Transaction";

interface TransactionFE {
    m_idea_id: number,
    m_idea_name: string,
    m_transaction_summary: string,
    m_transaction_id: number,
    m_entity_name: string,
    m_entity_id: number,
    m_datetime: string,
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
        <table id="transactions" class="dashboard-item interactive">
            <thead>
                <tr class="table-header-row">
                    <th>Idea</th>
                    <th>Transaction</th>
                    <th>Entity</th>
                    <th>Datetime</th>
                </tr>
            </thead>
            <tbody>
                <For each={transactions()}>
                {(item:TransactionFE, index) => (
                    <tr onclick={() => {showTransactionOverlay(item.m_transaction_id + index())}}>
                        <td><span onclick={(e) => {e.stopPropagation(); showIdeaOverlay(item.m_idea_id + index())}} class="interactive">{item.m_idea_name}</span></td>
                        <td>{item.m_transaction_summary}</td>
                        <td><span onclick={(e) => {e.stopPropagation(); showEntityOverlay(item.m_entity_id + index())}} class="interactive">{item.m_entity_name}</span></td>
                        <td>{item.m_datetime}</td>
                    </tr>
                )}
                </For>
            </tbody>
        </table>
    </>
    )
}

export default Transactions;