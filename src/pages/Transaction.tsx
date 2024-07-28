import { showOverlay } from "../components/Overlay";

export function showTransactionOverlay(transaction_id: number) {
    const Transaction = (
        <>
            <h2>ID: {transaction_id}</h2>
        </>
    )

    showOverlay("Transaction on __", Transaction);
}