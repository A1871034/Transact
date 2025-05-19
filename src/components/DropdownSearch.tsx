import '../styles/DropdownSearch.css'

import { Accessor, createComputed, createSignal, For, JSX, Show } from 'solid-js';

function DropdownSearch(
    item_holder: Accessor<any[]>,
    set_id_holder: any, 
    id_mname: string, 
    display_mname: string, 
    set_display: any = undefined,
): JSX.Element {
    const [displayStr, setDisplayStr] = createSignal("None selected...");
    const [filterBy, setFilterBy] = createSignal("");
    const [items, setItems] = createSignal([]);

    function filterFunc() {
        let must_include = filterBy().toLowerCase();
        let tmp_items: any = [];
        for (const item of item_holder()) {
            if ((item[display_mname] as string).toLowerCase().includes(must_include)) {
                tmp_items.push(item);
            }
        }
        setItems(tmp_items);
    }
    
    createComputed(filterFunc, "");

    return (
        <div class="tableWrap dropdown-search">
            <table class="interactive">
                <thead>
                    <tr class="table-header-row">
                        <th>
                            <input
                            id="ds-search"
                            type="text"
                            onkeyup={(e) => {setFilterBy(e.currentTarget.value)}}
                            placeholder="Search Entities..."
                            /><br/>
                            <div id="ds-display-selected" class="truncated" title={displayStr()}>
                                {displayStr()}
                            </div>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <For each={items()}>
                        {(item: any) => (
                        <tr onclick={() => {
                            set_id_holder(item[id_mname]);
                            setDisplayStr(item[display_mname]);
                            (set_display === undefined) ? {} : set_display(item[display_mname]);
                        }}>
                        <td id="ds-item-name">
                            {item[display_mname]}
                        </td>
                        </tr>
                        )}
                    </For>
                    <Show when={items().length == 0}>
                        <tr id="ds-nothing-to-display">
                            <td id="ds-item-name">
                                Nothing to Display
                            </td>
                        </tr>
                    </Show>
                </tbody>
            </table>
        </div>
    )
}

function DropdownSearchL(
    placeholder: string,
    item_accessor: Accessor<any[] | undefined>,
    display_lambda: (inp: any) => string,
    setter_lambda: (inp: any) => void,
): JSX.Element {
    const [selectedStr, setSelectedStr] = createSignal("None Selected...");
    const [filterBy, setFilterBy] = createSignal("");
    const [items, setItems] = createSignal([]);
    const [displayDropdown, setDisplayDropdown] = createSignal(false);

    const no_search_results_text = "Nothing to Display";

    function filterFunc() {
        let must_include = filterBy().toLowerCase();
        let tmp_items: any = [];
        if (item_accessor() === undefined) {
            return;
        }

        for (const item of item_accessor()!) {
            if (display_lambda(item).toLowerCase().includes(must_include)) {
                tmp_items.push(item);
            }
        }
        setItems(tmp_items);
    }

    function looseFocus() {
        const hovered = document.querySelectorAll( ":hover" );
        console.log(hovered);
        if (hovered.length === 0)
            return;
        if (hovered[hovered.length - 1].getAttribute("id") !== "ds-item-name")
            setDisplayDropdown(false);
        else if (hovered[hovered.length - 1].innerHTML == no_search_results_text) {
            // More effort than it is worth to keep focus on the input (required to prevent ui bugs).
            setDisplayDropdown(false);
        }
    }
    
    createComputed(filterFunc, "");

    return (<>
        <div class="dropdown-search">
            <div>
                <input
                    id="ds-search"
                    type="text"
                    onFocusIn={(e) => {e.preventDefault(); setDisplayDropdown(true); setTimeout(() => {e.target.select();}, 0)}}
                    onFocusOut={looseFocus}
                    onkeyup={(e) => {setFilterBy(e.currentTarget.value)}}
                    placeholder={placeholder}
                /><br/>
                <div id="ds-display-selected" title={selectedStr()}>
                    {selectedStr()}
                </div>
            </div>
            <Show when={displayDropdown()}>
                <div class="dropdown">
                    <table class="interactive">
                        <tbody>
                            <For each={Object.values(items())}>
                                {(item) => (
                                <tr onclick={() => {
                                    setDisplayDropdown(false);
                                    setter_lambda(item);
                                    setSelectedStr(display_lambda(item));
                                }}>
                                <td id="ds-item-name"
                                    style={(selectedStr() == display_lambda(item)) ? "background-color: var(--accent-color);" : ""}
                                >
                                    {display_lambda(item)}
                                </td>
                                </tr>
                                )}
                            </For>
                            <Show when={items().length == 0}>
                                <tr id="ds-nothing-to-display" style="cursor: default;">
                                    <td id="ds-item-name">
                                        {no_search_results_text}
                                    </td>
                                </tr>
                            </Show>
                        </tbody>
                    </table>
                </div>
            </Show>
        </div>
    </>)
}

export { DropdownSearch, DropdownSearchL }