import { invoke } from "@tauri-apps/api/core";
import { createSignal, For } from "solid-js";

import { BrandFE } from "../FrontEndTypes";

// import { showBrandOverlay } from "./Brand";
import { showNewBrandOverlay } from "./BrandNew";

export const [brands, setBrands] = createSignal([]);
async function get_brands() {
    // Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
    await invoke("get_brands")
        .then((recv_brands) => {
            if (recv_brands instanceof Array) {
                setBrands(recv_brands as never[])
                console.debug("received brands: ", brands());           
            } else {
                throw "Received brands was not an array"
            }
        })
        .catch((error) => console.error(error));
}

function Brands() {
    get_brands();
    return (
    <>
        <table class="dashboard-item interactive">
            <colgroup>
                <col span="1" style="width: 17%;" />
                <col span="1" style="width: 33%;" />
                <col span="1" style="width: 10%;" />
                <col span="1" style="width: 10%;" />
                <col span="1" style="width: 17%;" />
                <col span="1" style="width: 17%;" />
            </colgroup>
            <thead>
                <tr class="table-header-row">
                    <th>Name</th>
                </tr>
            </thead>
            <tbody>
                <For each={brands()}>
                {(item:BrandFE, _) => (
                    <tr >
                        <td>{item.m_name}</td>
                    </tr>
                )}
                </For>
            </tbody>
        </table>
        <button class="abs-br" onclick={showNewBrandOverlay}>
            <img src="/icons/plus-solid.svg" draggable="false"/>
        </button>
    </>
    )
}

export default Brands;