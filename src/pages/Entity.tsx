import { closeOverlay, showOverlay } from "../components/Overlay";
import { invoke } from "@tauri-apps/api/core";
import { entities, EntityFE, setEntities } from "../pages/Entities"

async function deleteEntity(entity_id: number) {
    console.debug("Submitting entity_id=", entity_id, " for deletion");
    await invoke("submit_delete_entity", { id: entity_id } )
        .then((deleted_id) => {
            if (deleted_id != entity_id) {
                throw "Requested deletion id differs from recieved deleted entity id.";
            }
            setEntities(entities().filter((item) => {
                return (item as EntityFE).m_id != deleted_id;
            }));
            closeOverlay();
        })
        .catch((err) => {
            console.error(err);
        });
}

export function showEntityOverlay(entity_id: number, entity_name: string) {
    const Entity = (
        <>
            <h2>{entity_name}</h2>
            <div>
                ID: <b>{entity_id}</b><br/>
                Last tx: <b>2024/10/12 13:05:30</b><br/>
                Transactions: <b>__</b><br/>
                Delta: <b>$___</b><br/>
            </div><br/>
            <div>
                Transactions list
            </div><br/>
            <div>
                Accounts list
            </div><br/>
            <div>
                Ideas list
            </div><br/>
            <div>
                <label>delete entity</label><br/>
                <button onclick={(_) => {deleteEntity(entity_id)}}>
                    <img src="/icons/bin-solid.svg" draggable="false"/>
                </button>
            </div>
        </>
    )

    showOverlay("Entity", Entity);
}