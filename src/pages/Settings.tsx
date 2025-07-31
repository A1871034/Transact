import { createRoot, createSignal } from 'solid-js';
import { invoke } from '@tauri-apps/api/core';

import { BareEntityFE } from '../FrontEndTypes';
import { dropdownEntry, DropdownSearchL } from '../components/DropdownSearch';

import { toggleTheme, toggleNavLabels } from '../App'

export const [centralEntityId, setCentralEntityId] = createSignal<number | undefined>();
const [bareEntities, setBareEntities] = createSignal<dropdownEntry[]>();

let local_central_entity_id = localStorage.getItem("centralEntityId") ? Number(localStorage.getItem("centralEntityId")) : undefined;
setCentralEntityId(local_central_entity_id);
console.debug("Loaded centralEntityId " + local_central_entity_id);

var central_entity_dropdown = createRoot(() => { 
    return DropdownSearchL("Select a central entity...", bareEntities, (de: dropdownEntry) => {
        setCentralEntityId(de.data_onset);
        localStorage.setItem("centralEntityId", de.data_onset.toString());
    });
});

function Settings() {

    invoke<BareEntityFE[]>("get_bare_entities")
        .then((bare_entities: BareEntityFE[]) => {
            setBareEntities(bare_entities.map<dropdownEntry>((ent) => {return {
                display: ent.m_name,
                data: undefined,
                data_onset: ent.m_id,
                hover: undefined,
            }}));
        })
        .catch((error) => {
            console.warn("Failed to get Bare Entities for settings: " + error)
        });

    return (
        <>
            <button onClick={toggleTheme}>Toggle Theme</button>
            <button onClick={toggleNavLabels}>Collapse</button>
            { central_entity_dropdown }
            <button onClick={() => {setCentralEntityId(undefined); localStorage.setItem("centralEntityId", "undefined")}}>
                Clear Central Entity
            </button>
        </>
    )
}

export default Settings;