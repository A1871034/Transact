import { invoke } from "@tauri-apps/api/core";
import { createRoot, createSignal, getOwner, JSX } from "solid-js";

import { showOverlay, closeOverlay } from "../components/Overlay";
import { BrandFE, ItemFE } from "../FrontEndTypes";

import { items, setItems } from "./Items";
import { get_time_as_if_database } from "../Utils";
import { dropdownEntry, DropdownSearchL } from "../components/DropdownSearch";

export function showNewItemOverlay() {
    const [name, setName] = createSignal("");
    const [description, setDescription] = createSignal("");
    const [brand, setBrand] = createSignal("");
    const [brandId, setBrandId] = createSignal<number>(-1);

    const [searchBrands, setSearchBrands] = createSignal<dropdownEntry[]>();

    async function getSearchBrands() {
        await invoke("get_brands")
            .then((recv_entities) => {
                if (recv_entities instanceof Array) {
                    setSearchBrands((recv_entities as BrandFE[]).map<dropdownEntry>(
                        (entity) => {return {
                            display: entity.m_name,
                            data: undefined,
                            data_onset: entity.m_id,
                            hover: undefined,
                        }}
                    ));
                    console.debug("received bare entities: ", searchBrands());           
                } else {
                    throw "Received entities are not an array"
                }
            })
            .catch((error) => console.error(error));
    };
    getSearchBrands()
    const brandsSearch = createRoot((): JSX.Element => {
        return DropdownSearchL("Brand...", searchBrands, (de: dropdownEntry) => {
            setBrandId(de.data_onset)
            setBrand(de.display)
        });
    }, getOwner());

    async function submitNewItem() {
        console.debug("submitNewItem: ", name(), " ", description());
        await invoke<number>("submit_new_item", { name: name(), brandId: brandId(), description: description() })
            .then((item_id: number) => {
                console.log("New item created with id " + item_id)
                var new_item: ItemFE = {
                    m_id: item_id,
                    m_name: name(),
                    m_brand: brand(),
                    m_brand_id: brandId(),
                    m_description: description(),
                    m_created: get_time_as_if_database(), 
                }
                setItems(items()?.concat(new_item as never));
                closeOverlay();
            })
            .catch((err) => {
                console.log(err)
            });
    }

    const ItemNew = (
        <>
            <form onSubmit={(e) => { e.preventDefault(); submitNewItem(); }}>
                {brandsSearch}
                <div>
                    <label for="name">Name:</label><br/>
                    <input
                        id="name"
                        onChange={(e) => setName(e.currentTarget.value)}
                        placeholder="Enter item's name..."
                        required
                    />
                </div>
                <div>
                    <label for="description">Description:</label><br/>
                    <textarea
                        id="description"
                        onChange={(e) => setDescription(e.currentTarget.value)}
                        placeholder="Enter item's description..."
                        />
                </div>
                <button type="submit">Add Item</button>
            </form>
        </>
    )

    showOverlay("Add Item", ItemNew);
}