import { invoke } from "@tauri-apps/api/core";
import { createSignal } from "solid-js";

import { showOverlay, closeOverlay } from "../components/Overlay";
import { BrandFE } from "../FrontEndTypes";

import { brands, setBrands } from "./Brands";

export function showNewBrandOverlay() {
    const [name, setName] = createSignal("");

    async function submitNewBrand() {
        console.debug("submitNewBrand: ", name());
        await invoke("submit_new_brand", { name: name() })
            .then((brand_id) => {
                var new_brand: BrandFE = {
                    m_id: brand_id as number,
                    m_name: name(),
                }
                setBrands(brands().concat(new_brand as never));
                closeOverlay();
            })
            .catch((err) => {
                console.log(err)
            });
    }

    const BrandNew = (
        <>
            <form onSubmit={(e) => { e.preventDefault(); submitNewBrand(); }}>
                <div>
                    <label for="name">Name:</label><br/>
                    <input
                        id="name"
                        onChange={(e) => setName(e.currentTarget.value)}
                        placeholder="Brand's name..."
                        required
                        autofocus
                    />
                </div>
                <button type="submit">Add Brand</button>
            </form>
        </>
    )

    showOverlay("Add Brand", BrandNew);
}