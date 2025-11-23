import { createRoot, createSignal, Show, JSX, For, getOwner } from "solid-js";
import { invoke } from "@tauri-apps/api/core";

import { BrandFE, DetailedItemFE, PackagedItemFE } from "../FrontEndTypes";
import { database_time_to_string } from "../Utils";

import { closeOverlay, showOverlay } from "../components/Overlay";
import { dropdownEntry, DropdownSearchL } from "../components/DropdownSearch";

async function get_item(item_id: number) {
    // Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
    let detailed_item = await invoke<DetailedItemFE>("get_item", { itemId: item_id });
    console.debug("got item: ", detailed_item);
    return detailed_item;
}

export function showItemOverlay(item_id: number) {
    const [showNewPackage, setShowNewPackage] = createSignal<boolean>(false);

    const [itemName, setItemName] = createSignal<string>();
    const [itemBrand, setItemBrand] = createSignal<string>("");
    const [itemBrandId, setItemBrandId] = createSignal<number>(-1);
    const [itemDesc, setItemDesc] = createSignal<string>();

    const [qty, setQty] = createSignal<number>(0);
    const [unit, setUnit] = createSignal<string>("");
    const [unitsPerQty, setUnitsPerQty] = createSignal<number>(0);
    
    const [editingItem, setEditingItem] = createSignal(false);
    const [searchBrands, setSearchBrands] = createSignal<dropdownEntry[]>();
    const [selectedBrand, setSelectedBrand] = createSignal<string>("");
    const [selectedBrandId, setSelectedBrandId] = createSignal<number>(-1);


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
        return DropdownSearchL(itemBrand(), searchBrands, (de: dropdownEntry) => {
            setSelectedBrandId(de.data_onset)
            setSelectedBrand(de.display)
        });
    }, getOwner());

    function toggleShowNewPackage() {
        if (showNewPackage()) {
            setShowNewPackage(false);
            return;
        }

        setShowNewPackage(true);
        setTimeout(() => {document.getElementById("qty")?.focus()}, 0);
    }

    async function submitNewPackaging() {
        await invoke("submit_new_item_packaging", { itemId: item_id, qty: qty(), unit: unit(), unitsPerQty: unitsPerQty() })
            .then(() => {
                closeOverlay();
                showItemOverlay(item_id);
            })
            .catch((err) => {
                console.error(err)
            });
    }

    async function handleToggleEditingItem(item: DetailedItemFE) {
            if (editingItem()) {
                let new_name = (document.getElementById("tx-name-input")! as HTMLInputElement).value;
                let new_description = (document.getElementById("tx-description-input")! as HTMLTextAreaElement).value;
                
                if (((new_name.length != 0) && (new_name != item.m_item.m_name)) || 
                    ((new_description.length != 0) && (new_description != item.m_item.m_description)) ||
                    ((selectedBrandId() != -1) && (selectedBrandId() != itemBrandId())))
                {
                    new_name = (new_name.length == 0) ? item.m_item.m_name : new_name;
                    new_description = (new_description.length == 0) ? item.m_item.m_description : new_description;
                    let new_brand = (selectedBrandId() == -1) ? itemBrand() : selectedBrand();
                    let new_brand_id = (selectedBrandId() == -1) ? itemBrandId() : selectedBrandId();
                    console.debug(`Attempting to update item ${item.m_item.m_name} with\n\tid: ${item.m_item.m_id}\n\tnew_name: ${new_name}\n\tnew_brand_id: ${new_brand_id}\n\tnew_description: ${new_description}`);
                    await invoke("update_item_details", {
                        itemId: item.m_item.m_id,
                        name: new_name,
                        brandId: new_brand_id,
                        description: new_description,
                    }).then(() => {
                        item.m_item.m_name = new_name;
                        item.m_item.m_description = new_description;
                        setItemBrand(new_brand);
                        setItemBrandId(new_brand_id);
                        setItemName(new_name);
                        setItemDesc(new_description);
                        setEditingItem(false);
                    })
                    .catch((err) => {
                        alert("Failed to update item details: " + err);
                    });
                } else {
                    setEditingItem(false);
                }
            } else {
                setEditingItem(true);
                setSelectedBrand("");
                setSelectedBrandId(-1);
            }
    }  

    function newItemPage() {
        setShowNewPackage(false);
        get_item(item_id).then((item) => {
            setItemBrand(item.m_item.m_brand);
            setItemBrandId(item.m_item.m_brand_id);
            setItemName(item.m_item.m_name);
            setItemDesc(item.m_item.m_description);
            const Item = createRoot((): JSX.Element => {
                return (
                    <div class="tile-container">
                        <div class="tile ta-c">
                            <div id="transaction-transfers">
                                <table class="dashboard-item" style="margin-bottom: 1em;">
                                    <colgroup>
                                        <col span="1" style="width: 30%;" />
                                        <col span="1" style="width: 70%;" />
                                    </colgroup>
                                    <thead>
                                        <tr class="bg-p">
                                            <th colspan="2">Details</th>
                                        </tr>
                                        <tr class="table-header-row sticky-top">
                                            <th>Detail</th>
                                            <th>Value</th>
                                        </tr>
                                    </thead>
                                    <tbody> 
                                        <tr>
                                            <td>Name</td>
                                            <td>
                                                <Show when={editingItem()} fallback={<>{itemName()}</>}>
                                                    <input placeholder={itemName()} id="tx-name-input"/>
                                                </Show>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>Brand</td>
                                            <td>
                                                <Show when={editingItem()} fallback={<>{itemBrand()}</>}>
                                                    {brandsSearch}
                                                </Show>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>Description</td>
                                            <td>
                                                <Show when={editingItem()} fallback={<>{itemDesc()}</>}>
                                                    <textarea placeholder={itemDesc()} id="tx-description-input"/>
                                                </Show>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>Packagings</td>
                                            <td>{/*@once*/ item.m_packaged_items.length}</td>
                                        </tr>
                                        <tr>
                                            <td>Created</td>
                                            <td>{/*@once*/ database_time_to_string(item.m_item.m_created)}</td>
                                        </tr>
                                    </tbody>
                                </table>
                                <div class="tile-button-spacer"/>
                                <div class="tile-button tile-button-bl">
                                    <button class="bg-red" 
                                        onclick={ (e) => {
                                            if (editingItem()) {
                                                setEditingItem(false);
                                            } else {
                                                if (confirm(`Delete item \"${item.m_item.m_name}\"?\n${item.m_packaged_items.length} associated packaged items will also be deleted.`)) {
                                                    invoke("delete_item", { itemId: item.m_item.m_id})
                                                        .then(() => { closeOverlay(); })
                                                        .catch(() => { alert("Failed to delete item."); });
                                                }
                                            }
                                            e.currentTarget?.blur();
                                        }}
                                    >
                                        <div>
                                            <img src={editingItem() ? "/icons/xmark-solid.svg" : "/icons/trash-can-solid.svg"} draggable="false"/>
                                        </div>
                                    </button>
                                </div>
                                <div class="tile-button tile-button-br">
                                            <button onclick={(e) => {handleToggleEditingItem(item); e.currentTarget?.blur(); }}>
                                        <div>
                                            <img src={editingItem() ? "/icons/floppy-disk-solid.svg" : "/icons/pencil-solid.svg"} draggable="false"/>
                                        </div>
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div class="tile ta-c hide-overflow">
                            <div id="transaction-transfers">
                                <table class="dashboard-item interactive">
                                    <colgroup>
                                        <col span="1" style="width: 30%;" />
                                        <col span="1" style="width: 30%;" />
                                        <col span="1" style="width: 40%;" />
                                    </colgroup>
                                    <thead>
                                        <tr class="bg-p">
                                            <th colspan="6">Packagings</th>
                                        </tr>
                                        <tr class="table-header-row sticky-top">
                                            <th>Qty</th>
                                            <th>Units/Qty</th>
                                            <th>Added</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <For each={item.m_packaged_items} fallback={(
                                            <tr>
                                                <td colspan="6">No packagings to display</td>
                                            </tr>
                                        )}>
                                        {(item: PackagedItemFE, _) => (      
                                            <tr>
                                                <td>{item.m_qty}</td>
                                                <td>{item.m_units_per_qty}{item.m_unit}</td>
                                                <td>{database_time_to_string(item.m_created)}</td>
                                            </tr>
                                        )}
                                        </For>
                                    </tbody>
                                </table>
                                <Show when={item.m_packaged_items.length > 0}>
                                    <div class="tile-button-spacer"/>
                                </Show>
                                <div class="tile-button tile-button-br">
                                    <button onclick={(e) => {toggleShowNewPackage(); e.currentTarget?.blur();} }>
                                        <div style={showNewPackage() ? "rotate: -45deg" : ""}>
                                            <img src="/icons/plus-solid.svg" draggable="false"/>
                                        </div>
                                    </button>
                                </div>
                            </div>
                        </div>
                        <Show when={showNewPackage()}>
                            <div class="tile">
                                <div class="tile-header">
                                    <h2>Add New Packaging</h2>
                                </div>
                                <div class="tile-contents flex-row">
                                    <div style="margin: auto;">
                                        <form onSubmit={(e) => { e.preventDefault(); submitNewPackaging(); }}>
                                            <div>
                                                <label for="qty">Qty:</label><br/>
                                                <input
                                                    id="qty"
                                                    type="number"
                                                    onChange={(e) => setQty(Number(e.currentTarget.value))}
                                                    placeholder="Enter quantity..."
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label for="units-per-qty">Units/Qty:</label><br/>
                                                <input
                                                    id="units-per-qty"
                                                    type="number"
                                                    min="0.001"
                                                    step="0.001"
                                                    onChange={(e) => setUnitsPerQty(Number(e.currentTarget.value))}
                                                    placeholder="Enter Units/Qty..."
                                                    required
                                                    />
                                            </div>
                                            <div>
                                                <label for="unit">Unit:</label><br/>
                                                <input
                                                    id="unit"
                                                    onChange={(e) => setUnit(e.currentTarget.value)}
                                                    placeholder="Enter unit..."
                                                    required
                                                    />
                                            </div>
                                            <button type="submit">Add Packaging</button>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </Show>
                    </div>
                )
            });

            showOverlay("Item: " + item.m_item.m_name, Item);
        });
    }

    newItemPage();
}