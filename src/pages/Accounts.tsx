import { invoke } from "@tauri-apps/api/tauri";
import { createSignal, For } from "solid-js";

import { showEntityOverlay } from "./Entity";
import { showNewAccountOverlay } from "./AccountNew";

export interface AccountFE {
    m_id: number,
    m_name: string,
    m_entity_id: number,
    m_entity_name: string,
}
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
                    <col span="1" style="width: 50%;" />
                    <col span="1" style="width: 50%;" />
                </colgroup>
                <thead>
                    <tr class="table-header-row">
                        <th>Name</th>
                        <th>Owner</th>
                    </tr>
                </thead>
                <tbody>
                    <For each={accounts()}>
                    {(item:AccountFE, _) => (
                        <tr>
                            <td>{item.m_name}</td>
                            <td><span onclick={(e) => {e.stopPropagation(); showEntityOverlay(item.m_entity_id)}} class="interactive">{item.m_entity_name}</span></td>
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