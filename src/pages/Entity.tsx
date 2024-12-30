import { closeOverlay, showOverlay } from "../components/Overlay";
import { invoke } from "@tauri-apps/api/tauri";
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

export function showEntityOverlay(entity_id: number) {
    const Entity = (
        <>
            <h2>ID: {entity_id}</h2>
            <button onclick={(_) => {deleteEntity(entity_id)}}>
                <img src="/icons/bin-solid.svg" draggable="false"/>
            </button>
        </>
    )

    showOverlay("Detailed Entity", Entity);
}