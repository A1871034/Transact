import { invoke } from "@tauri-apps/api/core";
import { createSignal } from "solid-js";

import { showOverlay, closeOverlay } from "../components/Overlay";
import { get_time_as_if_database } from "../Utils";
import { TransactionFE } from "../FrontEndTypes";

import { transactions, setTransactions } from "./Transactions";

export function showNewTransactionOverlay() {
    const [name, setName] = createSignal("");
    const [description, setDescription] = createSignal("");

    async function submitNewTransaction() {
        console.debug("submitNewTransaction: ", name(), " ", description());
        await invoke<number>("submit_new_transaction", { name: name(), description: description() })
            .then((transaction_id: number) => {
                console.log("New transaction created with id " + transaction_id)
                var new_transaction: TransactionFE = {
                    m_id: transaction_id,
                    m_name: name(),
                    m_description: description(),
                    m_closed: false,
                    m_count_transfers: 0,
                    m_latest_currency_transfer_datetime: null,
                    m_latest_currency_transfer_id: null,
                    m_created: get_time_as_if_database(), 
                }
                setTransactions(transactions()?.concat(new_transaction as never));
                closeOverlay();
            })
            .catch((err) => {
                console.log(err)
            });
    }

    const TransactionNew = (
        <>
            <form onSubmit={(e) => { e.preventDefault(); submitNewTransaction(); }}>
                <div>
                    <label for="name">Name:</label><br/>
                    <input
                        id="name"
                        onChange={(e) => setName(e.currentTarget.value)}
                        placeholder="Enter transaction's name..."
                        required
                    />
                </div>
                <div>
                    <label for="description">Description:</label><br/>
                    <textarea
                        id="description"
                        onChange={(e) => setDescription(e.currentTarget.value)}
                        placeholder="Enter transaction's description..."
                        required
                        />
                </div>
                <button type="submit">Add Transaction</button>
            </form>
        </>
    )

    showOverlay("Add Transaction", TransactionNew);
}