import { invoke } from "@tauri-apps/api/core";
import { createSignal, For } from "solid-js";

import { AccountFE } from "../FrontEndTypes";

import { showEntityOverlay } from "./Entity";
import { showNewAccountOverlay } from "./AccountNew";
import { showAccountOverlay } from "./Account";

export const [accounts, setAccounts] = createSignal([]);
async function get_accounts() {
    // Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
    await invoke("get_accounts")
        .then((recv_accounts) => {
            if (recv_accounts instanceof Array) {
                setAccounts(recv_accounts as never[])
                console.debug("received accounts: ", accounts());           
            } else {
                throw "Received accounts are not an array"
            }
        })
        .catch((error) => console.error(error));
}

function Accounts() {
    get_accounts();
    return (
    <>
        <div class="tableWrap">
            <table class="dashboard-item interactive">
                <colgroup>
                    <col span="1" style="width: 33%;" />
                    <col span="1" style="width: 33%;" />
                    <col span="1" style="width: 33%;" />
                </colgroup>
                <thead>
                    <tr class="table-header-row">
                        <th>Name</th>
                        <th>Owner</th>
                        <th>Added</th>
                    </tr>
                </thead>
                <tbody>
                    <For each={accounts()}>
                    {(item:AccountFE, _) => (
                        <tr onclick={() => {showAccountOverlay(item.m_id, item.m_name)}}>
                            <td>{item.m_name}</td>
                            <td><span onclick={(e) => {e.stopPropagation(); showEntityOverlay(item.m_entity_id, item.m_entity_name)}} class="interactive">{item.m_entity_name}</span></td>
                            <td>{new Date(item.m_added * 1000).toLocaleString("sv-SE")}</td>
                        </tr>
                    )}
                    </For>
                </tbody>
            </table>
        </div>
        <button class="abs-br" onclick={showNewAccountOverlay}>
            <img src="/icons/plus-solid.svg" draggable="false"/>
        </button>
    </>
    )
}

export default Accounts;