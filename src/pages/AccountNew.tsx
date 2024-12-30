import { createRoot, createSignal, For, getOwner, JSX } from "solid-js";
import { invoke } from "@tauri-apps/api/tauri";

import { showOverlay, closeOverlay } from "../components/Overlay";
import { DropdownSearch } from "../components/DropdownSearch";

import { accounts, setAccounts, AccountFE } from "../pages/Accounts";


interface bareEntity {
    m_id:number,
    m_name:string
}

export function showNewAccountOverlay() {
    const [name, setName] = createSignal("");
    const [newAccEntityId, setNewAccEntityId] = createSignal(-1);
    const [chosenEntityName, setChosenEntityName] = createSignal("");
    const [accSearchEntities, setAccSearchEntities] = createSignal([] as Array<bareEntity>);

    async function getAccSearchEntities() {
        await invoke("get_bare_entities")
            .then((bare_entities) => {setAccSearchEntities(bare_entities as Array<bareEntity>)})
            .catch();
    }
    getAccSearchEntities();

    async function submitNewAccount() {
        console.debug("submitNewAccount: ", name(), " ", newAccEntityId());
        if (newAccEntityId() < 0) {
            console.debug("Attempted new account submission before owner selection")
            return;
        }
        await invoke("submit_new_account", { name: name(), entityId: newAccEntityId() })
            .then((account_id) => {
                var new_entity: AccountFE = {
                    m_id: account_id as number,
                    m_name: name(),
                    m_entity_id: newAccEntityId(),
                    m_entity_name: chosenEntityName(),
                }
                setAccounts(accounts().concat(new_entity as never));
                closeOverlay();
            })
            .catch((err) => {
                console.error(err)
            });
    }

    const entityDropdownSearch = createRoot((): JSX.Element => {
        return DropdownSearch(accSearchEntities, setNewAccEntityId, "m_id", "m_name", setChosenEntityName);
    }, getOwner());
    const AccountNew = (
        <>
            <form onSubmit={(e) => { e.preventDefault(); submitNewAccount(); }}>
                <div>
                    <label for="name">Name:</label><br/>
                    <input
                        id="name"
                        onChange={(e) => setName(e.currentTarget.value)}
                        placeholder="Enter entity's name..."
                        required
                    />
                </div>
                <div>
                    <label for="entity">Owning Entity:</label>
                    {entityDropdownSearch}
                </div>
                <button type="submit">Add Account</button>
            </form>
        </>
    )

    showOverlay("Add Account", AccountNew);
}