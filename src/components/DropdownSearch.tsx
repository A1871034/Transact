import '../styles/DropdownSearch.css'

import { Setter, createComputed, createEffect, createSignal, For, JSX, Show, Accessor } from 'solid-js';

// TODO: Add support for arbitrary depth recursive dropdowns.
//  Interface with vec instead of accessor? i.e. "interface A {cur: T[], nxt: A}".
//  Ideally support for either or.

// TODO: Add function to close the dropdown?.

export interface dropdownEntry {
    display: string,
    data: number | dropdownEntry[],
    hover: string | undefined,
}

function DropdownSearchL(
    placeholder: string,
    entries: Accessor<dropdownEntry[] | undefined>,
    setId: Setter<number>
): JSX.Element {
    const [selectedStr, setSelectedStr] = createSignal("None Selected...");
    const [filterBy, setFilterBy] = createSignal("");
    const [items, setItems] = createSignal<dropdownEntry[]>([]);
    const [displayDropdown, setDisplayDropdown] = createSignal(false);
    
    const [dsIds, setDsIds] = createSignal<number[]>([]);
    const [selectedDsId, setSelectedDsId] = createSignal<number | undefined>();
    const [selectedDsIdx, setSelectedDsIdx] = createSignal<number | undefined>();
    const [keyboardHoverIdx, setKeyboardHoverIdx] = createSignal<number | undefined>();


    const no_search_results_text = "Nothing to Display";

    function filterFunc() {
        let must_include = filterBy().toLowerCase();
        let tmp_entries: dropdownEntry[] = [];
        let tmp_ds_ids: number[] = [];
        if (entries() === undefined) {
            return;
        }
        
        // We assume that order of returned items is constant.
        let ds_id = 0;
        for (const entry of entries()!) {
            if (entry.display.toLowerCase().includes(must_include)) {
                tmp_entries.push(entry);
                tmp_ds_ids.push(ds_id);
            }
            ds_id++;
        }
        
        console.debug(`Filtering to: ${JSON.stringify(tmp_entries, undefined, "")}`);

        // This section effectively acts as an "on resulting list changed callback"
        // Invalidate the known index of any selection before updating the lists.
        setKeyboardHoverIdx(undefined);
        setSelectedDsIdx(undefined);
        setItems(tmp_entries);
        setDsIds(tmp_ds_ids);
    }
    
    createComputed(filterFunc);

    function looseFocus() {
        setKeyboardHoverIdx(undefined);
        const hovered = document.querySelectorAll( ":hover" );
        console.debug("Dropdown lost focus, mouse hovering the following element");
        console.debug(hovered);
        if (hovered.length === 0)
            return;
        if (!(hovered[hovered.length - 1].classList.contains("ds-item-name") || hovered[hovered.length - 1].classList.contains("ds-expand-icon")))
            setDisplayDropdown(false);
        else if (hovered[hovered.length - 1].innerHTML == no_search_results_text) {
            // More effort than it is worth to keep focus on the input (required to prevent ui bugs).
            setDisplayDropdown(false);
        }
    }

    let dropdownRef: HTMLUListElement | undefined;
    
    // TODO: Create reorientDropdown function which only adjusts height if above and left placement if on left (all on filter update).
    function orientDropdown() {
        if (dropdownRef === undefined) {return}
        dropdownRef = dropdownRef!;
        let covering = false;

        // Reorient to default location
        dropdownRef.style.top = "-1em";
        dropdownRef.style.left = "100%";

        let rect = dropdownRef.getBoundingClientRect();
        const parent_rect = dropdownRef.parentElement!.getBoundingClientRect();

        // Check horizontal bounds.
        if ((rect.width + rect.x) > window.innerWidth) {
            // Too big on right, attempt to orient left.
            if ((rect.x - parent_rect.width - rect.width) > 0) {
                dropdownRef.style.left = `-${rect.width}px`;
            } else {
                // Still too large, center it.
                dropdownRef.style.left = `calc(50% - ${rect.width / 2}px)`;
                
                // Move vertically to try and uncover dropdown area.
                dropdownRef.style.top = "calc(100% - 1em)";
                rect = dropdownRef.getBoundingClientRect();

                covering = true;
            }
        }

        // Check vertical bounds.
        if ((rect.height + rect.y) > window.innerHeight) {
            // Overflows bottom.
            // If we are covering attempt to place it above, otherwise as low as possible.
            if (covering && ((rect.y - parent_rect.height - rect.height) > 0)) {
                dropdownRef.style.top = `calc(-1em - ${rect.height}px)`;
            }
            else  {
                dropdownRef.style.top = `calc(-1em - ${parent_rect.y + rect.height - window.innerHeight}px)`;
            }
        }
    }

    function openDropdown() {
        setDisplayDropdown(true);
        orientDropdown();
        if (selectedDsIdx() !== undefined) {
            conditionalScrollToY(dropdownRef?.children[selectedDsIdx()!] as HTMLLIElement);
        }
    }

    function dsKeyboardControls(e: KeyboardEvent) {
        let stop_bubble = true;
        switch (e.key) {
            case "Escape":
                setKeyboardHoverIdx(undefined);
                setDisplayDropdown(false);
                (e.target as (HTMLInputElement | null))?.blur();
                break;
            case "Enter":
                // Open the dropdown if there is none.
                if (!displayDropdown()) {
                    openDropdown();
                    e.preventDefault();
                    break;
                }

                // Select the hovered item.
                if (keyboardHoverIdx() !== undefined) {
                    setDisplayDropdown(false);
                    const item: dropdownEntry = items()[keyboardHoverIdx()!];
                    setSelectedDsId(dsIds()[keyboardHoverIdx()!]);
                    setKeyboardHoverIdx(undefined);
                    setId(item.data as number);
                    setSelectedStr(item.display);
                    e.preventDefault();
                    break;
                }

                //  Select the only item.
                if (items().length == 1) {
                    setDisplayDropdown(false);
                    const item: dropdownEntry = items()[0];
                    setSelectedDsId(dsIds()[0]);
                    setId(item.data as number);
                    setSelectedStr(item.display);
                    e.preventDefault();
                }
                break;
            case "Tab":
                if (!displayDropdown()) {break}
                setDisplayDropdown(false);
                if (selectedDsId() !== undefined) {break}

                if (items().length == 1) {
                    //  Select the only item.
                    const item: dropdownEntry = items()[0];
                    setSelectedDsId(dsIds()[0]);
                    setId(item.data as number);
                    setSelectedStr(item.display);
                }
                break;
            case "ArrowUp":
                if (!(items().length > 0)) {break}
                e.preventDefault();

                // "Hover" the bottom element OR above selected if nothing is hovered.
                if ((keyboardHoverIdx() === undefined)) {
                    if ((selectedDsIdx() === undefined) || (selectedDsIdx()! == 0)) {
                        setKeyboardHoverIdx(items().length - 1);
                    } else {
                        // Must be an item selected that is not at the top, hover above that.
                        setKeyboardHoverIdx(selectedDsIdx()! - 1);
                    }
                    break;
                }

                if (keyboardHoverIdx()! > 0) {
                    setKeyboardHoverIdx(keyboardHoverIdx()! - 1);
                }
                break;
            case "ArrowRight":
                // TODO: Expand to submenu? might need to leave this to enter...
                break;
            case "ArrowDown":
                if (!(items().length > 0)) {break}
                e.preventDefault();

                // "Hover" the top element OR below selected if nothing is hovered.
                if ((keyboardHoverIdx() === undefined)) {
                    if ((selectedDsIdx() === undefined) || (selectedDsIdx()! >= (items().length - 1))) {
                        setKeyboardHoverIdx(0);
                    } else {
                        // Must be an item selected that is not at the bottom, hover below that.
                        setKeyboardHoverIdx(selectedDsIdx()! + 1);
                    }
                    break;
                }

                if (keyboardHoverIdx()! < (items().length - 1)) {
                    setKeyboardHoverIdx(keyboardHoverIdx()! + 1);
                }
                break;
            case "ArrowLeft":
                break
            default:
                stop_bubble = false;
                break;
        }

        if (stop_bubble) {
            e.stopPropagation();
        }
    }

    function updateSelectedIdx(i: number): Boolean {
        setSelectedDsIdx(i); 
        return true; 
    }

    function conditionalScrollToY(elem: HTMLLIElement) {
        if (elem.parentElement === undefined) {
            return;
        }

        const rect = elem.getBoundingClientRect();
        const parent_rect = elem.parentElement!.getBoundingClientRect();

        if ((rect.top < parent_rect.top) || 
            (rect.bottom > parent_rect.bottom)) {
            elem.scrollIntoView(); 
        }
    }

    const [selectedIdxs, setSelectedIdxs] = createSignal<number[]>([]);

    function selectIdx(i:number, depth:number) {
        if (depth > selectedIdxs().length) {
            console.error("Attempted to select Idx at sub_level > (current_deepest_level + 1)");
            return;
        }
        if (depth == selectedIdxs().length) {
            setSelectedIdxs(selectedIdxs().concat(i));
            return;
        }
        setSelectedIdxs(selectedIdxs().splice(0, depth).concat(i));
    }

    function getSublevels(items: dropdownEntry[], depth: number, prefix: string) {
        return <ul class="ds-sublevel dropdown"
            style="opacity: 0;"
            ref={selfElem => {setTimeout(() => {
                const parent_rect = selfElem!.parentElement!.getBoundingClientRect();
                const origin_list_rect = selfElem.parentElement!.children[1]!.getBoundingClientRect(); // TODO: Come here when it breaks.
                selfElem.style.left = `${parent_rect.width + origin_list_rect.width}px`;
                selfElem.style.opacity = "";
            },0);}
        }>
            <For each={Object.values(items)}
                fallback={
                    <li class="ds-item-name ds-nothing-to-display">
                        {no_search_results_text}
                    </li>
            }>
                {(item: dropdownEntry, i) => (
                    <li ref={elem => {
                            createEffect(() => {if ((keyboardHoverIdx() == i())) {conditionalScrollToY(elem)}
                        })}}
                        class={"ds-item-name" +
                            ((i() == selectedIdxs()[depth]) ? " ds-selected" : "")}
                        style={((keyboardHoverIdx() == i()) ? "box-shadow: inset 0 0 0 1px white;" : "") + 
                            (((item.data instanceof Array) && (item.data.length == 0)) ? "color: var(--red-color);" : "")}     
                        onclick={(e) => {
                            if (!(item.data instanceof Array)) {
                                setSelectedStr(prefix + item.display);
                                setId(item.data as number);
                                setDisplayDropdown(false);
                            }
                            selectIdx(i(), depth);
                            e.stopPropagation();
                        }}
                    >
                        {item.display}
                        <Show when={(item.data instanceof Array) && (item.data.length > 0)}>
                            <img src="public/icons/caret-down-solid.svg" class="ds-expand-icon" draggable="false"/>
                        </Show>
                    </li>
                )}
            </For>
            <Show when={selectedIdxs().length > depth}>
                {getSublevels(items[depth].data as dropdownEntry[], depth + 1, prefix + items[depth].display + " | ")}
            </Show>
        </ul>
    }

    return (<>
        <div class="dropdown-search"
            onkeydown={dsKeyboardControls}>
            <div>
                <input
                    class="ds-search"
                    type="text"
                    onclick={(e) => {e.stopImmediatePropagation(); openDropdown(); }}
                    onFocusIn={openDropdown}
                    onFocusOut={looseFocus}
                    oninput={(e) => {
                        setFilterBy(e.currentTarget.value);
                        if (!displayDropdown()) {
                            openDropdown();
                        } else {
                            orientDropdown();
                        }
                    }}
                    placeholder={placeholder}
                /><br/>
                <div class="ds-display-selected" title={selectedStr()}>
                    {selectedStr()}
                </div>
            </div>
            <Show when={displayDropdown()}>
                <ul ref={dropdownRef}
                    class="dropdown">
                    <For each={Object.values(items())}
                        fallback={
                            <li class="ds-item-name ds-nothing-to-display">
                                {no_search_results_text}
                            </li>
                    }>
                        {(item: dropdownEntry, i) => (
                            <li ref={elem => {
                                    createEffect(() => {if ((keyboardHoverIdx() == i())) {conditionalScrollToY(elem)}
                                })}}
                                class={"ds-item-name" +
                                    ((dsIds()[i()] == selectedDsId()) && 
                                        (updateSelectedIdx(i())) ? 
                                        " ds-selected" : ""
                                )}
                                style={((keyboardHoverIdx() == i()) ? "box-shadow: inset 0 0 0 1px white;" : "") + 
                                        (((item.data instanceof Array) && (item.data.length == 0)) ? "color: var(--red-color);" : "")
                                }    
                                onclick={(e) => {
                                    setSelectedDsId(dsIds()[i()]);
                                    if (!(item.data instanceof Array)) {
                                        setId(item.data as number);
                                        setSelectedStr(item.display);
                                        setDisplayDropdown(false);
                                    } else {
                                        setSelectedIdxs([]);
                                    }
                                    e.stopPropagation();
                                }}
                            >
                                {item.display}
                                <Show when={(item.data instanceof Array) && (item.data.length > 0)}>
                                    <img src="public/icons/caret-down-solid.svg" class="ds-expand-icon" draggable="false"/>
                                </Show>
                            </li>
                        )}
                    </For>
                </ul>
                <Show when={selectedDsIdx() != undefined}>
                    {getSublevels(items()[selectedDsIdx() as number].data as dropdownEntry[], 0, items()[selectedDsIdx() as number].display + " | ")}
                </Show>
            </Show>
        </div>
    </>)
}

export { DropdownSearchL }