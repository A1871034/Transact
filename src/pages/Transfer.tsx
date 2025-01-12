import { showOverlay } from "../components/Overlay";

export function showTransferOverlay(transfer_id: number) {
    const Transfer = (
        <>
            <h2>ID: {transfer_id}</h2>
        </>
    )

    showOverlay("Transfer on __", Transfer);
}