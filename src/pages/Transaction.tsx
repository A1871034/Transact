import { showOverlay } from "../components/Overlay";

export function showTransactionOverlay(transaction_id: number) {
    const Idea = (
        <>
            <h2>ID: {transaction_id}</h2>
        </>
    )

    showOverlay("Payslip", Idea);
}