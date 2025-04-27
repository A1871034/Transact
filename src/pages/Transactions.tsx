import { invoke } from "@tauri-apps/api/core";
import { createSignal, For } from "solid-js";

import { database_time_to_string } from "../Utils";
import { TransactionFE } from "../FrontEndTypes";

import { showTransactionOverlay } from "./Transaction";
import { showTransferOverlay } from "./Transfer";
import { showNewTransactionOverlay } from "./TransactionNew";

export const [transactions, setTransactions] = createSignal<Array<TransactionFE>>();
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
                {(item:TransactionFE, _) => (
                    <tr onclick={() => {showTransactionOverlay(item.m_id)}}>
                        <td>{item.m_name}</td>
                        <td>{(item.m_description.length > 47) ? item.m_description.slice(0, 47).trimEnd() + "..." : item.m_description}</td>
                        <td>{item.m_closed ? "closed" : "open"}</td>
                        <td>{item.m_count_transfers}</td>
                        <td>
                            <span
                                onclick={(e) => {
                                    e.stopPropagation();
                                    if (item.m_latest_currency_transfer_id !== null) {
                                        showTransferOverlay(item.m_latest_currency_transfer_id)
                                    }
                                }}
                                class={(item.m_latest_currency_transfer_id !== undefined) ? "interactive" : ""}
                            >
                                {item.m_latest_currency_transfer_datetime}
                            </span>
                        </td>
                        <td>{database_time_to_string(item.m_created)}</td>
                    </tr>
                )}
                </For>
            </tbody>
        </table>
        <button class="abs-br" onclick={showNewTransactionOverlay}>
            <img src="/icons/plus-solid.svg" draggable="false"/>
        </button>
        <h2>TODO:</h2>
        <p>Table is sorted open -&gt; last_transaction -&gt; create</p>
    </>
    )
}

export default Transactions;