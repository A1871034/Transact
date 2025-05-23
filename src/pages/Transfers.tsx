import { invoke } from "@tauri-apps/api/core";
import { createSignal, For } from "solid-js";

import { TransferFE } from "../FrontEndTypes";

import { showTransactionOverlay } from "./Transaction";
import { showEntityOverlay } from "./Entity";
import { showNewTransferOverlay } from "./TransferNew";
import { showTransferOverlay } from "./Transfer";

export const [transfers, setTransfers] = createSignal([]);
async function get_transfers() {
    // Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
    setTransfers(await invoke("get_transfers"));
    console.debug("received transfers: ", transfers());
}

function Transfers() {
    get_transfers();
    return (
    <>
        <table id="transactions" class="dashboard-item interactive">
            <thead>
                <tr class="table-header-row">
                    <th>Transaction</th>
                    <th>Transfer</th>
                    <th>Entity</th>
                    <th>Datetime</th>
                </tr>
            </thead>
            <tbody>
                <For each={transfers()}>
                {(item:TransferFE, index) => (
                    <tr onclick={() => {showTransferOverlay(item.m_transaction_id + index())}}>
                        <td><span onclick={(e) => {e.stopPropagation(); showTransactionOverlay(item.m_transaction_id)}} class="interactive">{item.m_transaction_name}</span></td>
                        <td>{item.m_transfer_summary}</td>
                        <td><span onclick={(e) => {e.stopPropagation(); showEntityOverlay(item.m_entity_id, item.m_entity_name)}} class="interactive">{item.m_entity_name}</span></td>
                        <td>{item.m_datetime}</td>
                    </tr>
                )}
                </For>
            </tbody>
        </table>
        <button class="abs-br" onclick={showNewTransferOverlay}>
            <img src="/icons/plus-solid.svg" draggable="false"/>
        </button>
    </>
    )
}

export default Transfers;