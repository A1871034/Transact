import { createRoot, createSignal, Show, JSX, For, JSXElement, Accessor, Setter } from "solid-js";
import { invoke } from "@tauri-apps/api/core";

import { DetailedTransactionFE, TransferFE, TransferType } from "../FrontEndTypes";
import { database_time_to_string } from "../Utils";

import { NewCurrencyTransfer } from "../components/NewTransfers";
import { closeOverlay, showOverlay } from "../components/Overlay";
import { getShowNavLabels } from "../App";
import { showEntityOverlay } from "./Entity";
import { centralEntityId } from "./Settings";

async function get_transaction(transaction_id: number) {
    // Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
    let detailed_transaction = await invoke<DetailedTransactionFE>("get_transaction", { transactionId: transaction_id });
    console.debug("got transaction: ", detailed_transaction);
    return detailed_transaction;
}

const transfer_types_selection = {
    "Currency": {
        m_icon: "/icons/money-bill-transfer-solid.svg",
        m_label: "Money",
        m_tx_type: TransferType.Currency,
    },
    "Item": {
        m_icon: "/icons/dolly-solid.svg",
        m_label: "Item",
        m_tx_type: TransferType.Item,
    },
    "Asset": {
        m_icon: "/icons/hand-holding-dollar-solid.svg",
        m_label: "Asset",
        m_tx_type: TransferType.Asset,
    },
    "Debt": {
        m_icon: "/icons/landmark-solid.svg",
        m_label: "Debt",
        m_tx_type: TransferType.Debt,
    },
};

export function showTransactionOverlay(transaction_id: number) {
    const [showNewTf, setShowNewTf] = createSignal(false);
    const [newTfType, setNewTfType] = createSignal<TransferType>();
    const [toShowNewTf, setToShowNewTf] = createSignal<JSXElement>(<></>);
    
    const [txName, setTxName] = createSignal<string>();
    const [txDesc, setTxDesc] = createSignal<string>();
    const [txClosed, setTxClosed] = createSignal<boolean>();
    
    const [editingTx, setEditingTx] = createSignal(false);
    
    function toggleShowTransferTypes() {
        if (!showNewTf()) {
            handleSetNewTfType(TransferType.Currency);
            setShowNewTf(true);
        } else {
            setToShowNewTf(<></>);
            setShowNewTf(false);
        } 
    }

    async function handleToggleEditingTx(tx: DetailedTransactionFE) {
            if (editingTx()) {
                let new_name = (document.getElementById("tx-name-input")! as HTMLInputElement).value;
                let new_description = (document.getElementById("tx-description-input")! as HTMLTextAreaElement).value;
                let closed = (document.getElementById("tx-closed-checkbox")! as HTMLInputElement).checked;
                
                if (((new_name.length != 0) && (new_name != tx.m_transaction.m_name)) || 
                    ((new_description.length != 0) && (new_description != tx.m_transaction.m_description)) ||
                    (closed != tx.m_transaction.m_closed))
                {
                    new_name = (new_name.length == 0) ? tx.m_transaction.m_name : new_name;
                    new_description = (new_description.length == 0) ? tx.m_transaction.m_description : new_description;
                    console.debug(`Attempting to update tx ${tx.m_transaction.m_name} with\n\tid: ${tx.m_transaction.m_id}\n\tnew_name: ${new_name}\n\tnew_description: ${new_description}\n\tnew_closed: ${closed}`);
                    await invoke("update_transaction_details", {
                        txId: tx.m_transaction.m_id,
                        name: new_name,
                        description: new_description,
                        closed: closed,
                    }).then(() => {
                        setTxName(new_name);
                        setTxDesc(new_description);
                        setTxClosed(closed);
                        setEditingTx(false);
                    })
                    .catch((err) => {
                        alert("Failed to update transaction details: " + err);
                    });
                } else {
                    setEditingTx(false);
                }
            } else {
                setEditingTx(true);
            }
    }
    
    function handleSetNewTfType(newTfType: TransferType) {
        switch (newTfType) {
            case TransferType.Currency:
                setToShowNewTf(NewCurrencyTransfer(transaction_id, (_) => {closeOverlay(); newTranssactionPage()}));
                setTimeout(() => {document.getElementById("amount")?.focus()}, 0);
                break;
            default:
                alert("Unimplmented transfer type :(")
                return;
        }
        setNewTfType(newTfType);
    }        

    const valueColoring = (transfer: TransferFE) => {
        let ret = "";
        switch (transfer.m_type) {
            case TransferType.Currency:
                if (transfer.m_to_id == transfer.m_from_id) {
                    break;
                }

                if (transfer.m_to_id == centralEntityId()) {
                    ret = "color: green;"
                }
                if (transfer.m_from_id == centralEntityId()) {
                    ret = "color: red;"
                } 
                break;
            default:
                break;
        }
        return ret;
    }
            
    function newTranssactionPage() {
        setShowNewTf(false);
        setNewTfType(TransferType.Currency);
        get_transaction(transaction_id).then((tx) => {
            setTxName(tx.m_transaction.m_name);
            setTxDesc(tx.m_transaction.m_description);
            setTxClosed(tx.m_transaction.m_closed);
            const Transaction = createRoot((): JSX.Element => {
                return (
                    <div class="tile-container">
                        <div class="tile ta-c hide-overflow">
                            <div id="transaction-transfers">
                                <table class="dashboard-item">
                                    <colgroup>
                                        <col span="1" style="width: 30%;" />
                                        <col span="1" style="width: 70%;" />
                                    </colgroup>
                                    <thead>
                                        <tr class="bg-p">
                                            <th colspan="2">Details</th>
                                        </tr>
                                        <tr class="table-header-row sticky-top">
                                            <th>Detail</th>
                                            <th>Value</th>
                                        </tr>
                                    </thead>
                                    <tbody> 
                                        <tr>
                                            <td>Name</td>
                                            <Show when={editingTx()} fallback={
                                                    <>
                                                        <td>{txName()}</td>
                                                    </>
                                                }>
                                                <input placeholder={txName()} id="tx-name-input"/>
                                            </Show>
                                        </tr>
                                        <tr>
                                            <td>Description</td>
                                            <Show when={editingTx()} fallback={
                                                    <>
                                                        <td>{txDesc()}</td>
                                                    </>
                                                }>
                                                <textarea placeholder={txDesc()} id="tx-description-input"/>
                                            </Show>
                                        </tr>
                                        <tr>
                                            <td>Closed</td>
                                            <Show when={editingTx()} fallback={
                                                    <>
                                                        <td>{String(txClosed())}</td>
                                                    </>
                                                }>
                                                <input id="tx-closed-checkbox" type="checkbox" checked={txClosed()}/>
                                            </Show>
                                        </tr>
                                        <tr>
                                            <td>Transfers</td>
                                            <td>{/*@once*/ tx.m_transfers.length}</td>
                                        </tr>
                                        <tr>
                                            <td>Created</td>
                                            <td>{/*@once*/ database_time_to_string(tx.m_transaction.m_created)}</td>
                                        </tr>
                                    </tbody>
                                </table>
                                <div class="tile-button-spacer"/>
                                <div class="tile-button tile-button-bl">
                                    <button class="bg-red" 
                                        onclick={ (e) => {
                                            if (editingTx()) {
                                                setEditingTx(false);
                                            } else {
                                                if (confirm(`Delete transaction \"${tx.m_transaction.m_name}\"?\n${tx.m_transfers.length} associated transfers will also be deleted.`)) {
                                                    invoke("delete_transaction", { transactionId: tx.m_transaction.m_id})
                                                        .then(() => { closeOverlay(); })
                                                        .catch(() => { alert("Failed to delete transaction."); });
                                                }
                                            }
                                            e.currentTarget?.blur();
                                        }}
                                    >
                                        <div>
                                            <img src={editingTx() ? "/icons/xmark-solid.svg" : "/icons/trash-can-solid.svg"} draggable="false"/>
                                        </div>
                                    </button>
                                </div>
                                <div class="tile-button tile-button-br">
                                            <button onclick={(e) => {handleToggleEditingTx(tx); e.currentTarget?.blur(); }}>
                                        <div>
                                            <img src={editingTx() ? "/icons/floppy-disk-solid.svg" : "/icons/pencil-solid.svg"} draggable="false"/>
                                        </div>
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div class="tile ta-c hide-overflow">
                            <div id="transaction-transfers">
                                <table class="dashboard-item interactive">
                                    <colgroup>
                                        <col span="1" style="width: 10%;" />
                                        <col span="1" style="width: 20%;" />
                                        <col span="1" style="width: 10%;" />
                                        <col span="1" style="width: 20%;" />
                                        <col span="1" style="width: 20%;" />
                                        <col span="1" style="width: 20%;" />
                                    </colgroup>
                                    <thead>
                                        <tr class="bg-p">
                                            <th colspan="6">Transfers</th>
                                        </tr>
                                        <tr class="table-header-row sticky-top">
                                            <th>Type</th>
                                            <th>Name</th>
                                            <th>Value</th>
                                            <th>To</th>
                                            <th>From</th>
                                            <th>Time</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <For each={tx.m_transfers} fallback={(
                                            <tr>
                                                <td colspan="6">No transfers to display</td>
                                            </tr>
                                        )}>
                                        {(item:TransferFE, _) => (      
                                            <tr>
                                                <td>
                                                    <img
                                                        src={ transfer_types_selection[item.m_type].m_icon }
                                                        title={ transfer_types_selection[item.m_type].m_label }
                                                        class="info-icon"
                                                        draggable="false"
                                                    />
                                                </td>
                                                <td>{((item.m_type) == TransferType.Currency) ? "Money" : item.m_type}</td>
                                                <td style={valueColoring(item)}>{item.m_value}</td>
                                                <td>
                                                    <span class="interactive"
                                                        onclick={(e) => {e.stopPropagation(); showEntityOverlay(item.m_to_id, item.m_to_name);}}
                                                    >
                                                        {item.m_to_name}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span class="interactive"
                                                        onclick={(e) => {e.stopPropagation(); showEntityOverlay(item.m_from_id, item.m_from_name);}}
                                                    >
                                                        {item.m_from_name}
                                                    </span>
                                                </td>
                                                <td>{database_time_to_string(item.m_time)}</td>
                                            </tr>
                                        )}
                                        </For>
                                    </tbody>
                                </table>
                                <Show when={tx.m_transfers.length > 0}>
                                    <div class="tile-button-spacer"/>
                                </Show>
                                <div class="tile-button tile-button-br">
                                    <button onclick={(e) => {toggleShowTransferTypes(); e.currentTarget?.blur();} }>
                                        <div style={showNewTf() ? "rotate: -45deg" : ""}>
                                            <img src="/icons/plus-solid.svg" draggable="false"/>
                                        </div>
                                    </button>
                                </div>
                            </div>
                        </div>
                        <Show when={showNewTf()}>
                            <div style="flex-basis: 100%;" class="tile">
                                <div class="tile-header">
                                    <h2>Add New Transfer</h2>
                                </div>
                                <div id="new-tx-content" class="tile-contents">
                                    <nav id="transfer-type-select">
                                        <For each={Object.values(transfer_types_selection)}>
                                            {(tx_type) => (
                                                <a onclick={() => {handleSetNewTfType(tx_type.m_tx_type)}} class={newTfType() === tx_type.m_tx_type ? "active" : "inactive"} href="#">
                                                    <img src={tx_type.m_icon} class="icon" draggable="false"/>
                                                    {getShowNavLabels() ? (<span>{tx_type.m_label}</span>) : ""}
                                                </a>
                                            )}
                                        </For>
                                    </nav>
                                    <div>
                                        { toShowNewTf() }
                                    </div>
                                </div>
                            </div>
                        </Show>
                    </div>
                )
            });

            showOverlay("Transaction: " + tx.m_transaction.m_name, Transaction);
        });
    }

    newTranssactionPage();
}