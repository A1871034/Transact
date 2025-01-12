import { invoke } from "@tauri-apps/api/core";

import { closeOverlay, showOverlay } from "../components/Overlay";
import { AccountFE } from "../FrontEndTypes";

import { accounts, setAccounts } from "./Accounts";

async function deleteAccount(account_id: number) {
    console.debug("Submitting account_id=", account_id, " for deletion");
    await invoke("submit_delete_account", { id: account_id } )
        .then((deleted_id) => {
            if (deleted_id != account_id) {
                throw "Requested deletion id differs from recieved deleted accounts id.";
            }
            setAccounts(accounts().filter((item) => {
                return (item as AccountFE).m_id != deleted_id;
            }));
            closeOverlay();
        })
        .catch((err) => {
            console.error(err);
        });
}

export function showAccountOverlay(account_id: number, account_name: string) {
    const Account = (
        <>
            <h2>{account_name}</h2>
            <div>
                Owner: <b>Example Owner</b><br/>
                Last tx: <b>2024/10/12 13:05:30</b><br/>
                Transactions: <b>__</b><br/>
                Delta: <b>$___</b><br/>
                ID: <b>{account_id}</b><br/>
            </div><br/>
            <div>
                Transactions list
            </div><br/>
            <div>
                Ideas list
            </div><br/>
            <div>
                <label>delete entity</label><br/>
                <button onclick={(_) => {deleteAccount(account_id)}}>
                    <img src="/icons/bin-solid.svg" draggable="false"/>
                </button>
            </div>
        </>
    )

    showOverlay("Account", Account);
}