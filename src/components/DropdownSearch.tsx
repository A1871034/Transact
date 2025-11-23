import { Portal } from 'solid-js/web';
import '../styles/DropdownSearch.css'

import { createComputed, createEffect, createSignal, For, JSX, Show, Accessor, onMount, onCleanup } from 'solid-js';

// TODO: Add function to close the dropdown?.

export interface dropdownEntry {
    display: string,
    data: dropdownEntry[] | undefined,
    data_onset: any,
    hover: string | undefined,
}

function DropdownSearchL(
    placeholder: string,
    entries: Accessor<dropdownEntry[] | undefined>,
    set_lambda: Function,
): JSX.Element {
    const [selectedStr, setSelectedStr] = createSignal("None Selected...");
    const [filterBy, setFilterBy] = createSignal("");
    const [items, setItems] = createSignal<dropdownEntry[]>([]);
    const [displayDropdown, setDisplayDropdown] = createSignal(false);

    const [dsIds, setDsIds] = createSignal<number[]>([]);
    const [firstSelectedIdx, setFirstSelectedIdx] = createSignal<number | undefined>();
    const [selectedIdxs, setSelectedIdxs] = createSignal<number[]>([]); // selectedIdxs[0] is actually an id and not an idx.
    const [displaySelected, setDisplaySelected] = createSignal(true);

    const [keyboardHoverIdx, setKeyboardHoverIdx] = createSignal<number | undefined>();
    const [keyboardMode, setKeyboardMode] = createSignal(false);

    const no_search_results_text = "Nothing to Display";

    let allDropdowns: HTMLDivElement | undefined;
    let dropdownSearch: HTMLDivElement | undefined;

    function filterFunc() {
        if (entries() === undefined) {return}
        
        let must_include = filterBy().toLowerCase();
        let tmp_entries: dropdownEntry[] = [];
        let tmp_ds_ids: number[] = [];

        // We assume that order of returned items is constant.
        let selected_in_filter = false;
        let ds_id = 0;
        for (const entry of entries()!) {
            if (entry.display.toLowerCase().includes(must_include)) {
                tmp_entries.push(entry);
                tmp_ds_ids.push(ds_id);
                if (!selected_in_filter && (selectedIdxs().length > 0) && (ds_id == selectedIdxs()[0])) {
                    selected_in_filter = true;
                    setFirstSelectedIdx(tmp_ds_ids.length - 1);
                }
            }
            ds_id++;
        }

        console.log("FILTER")

        // console.debug(`Filtering to: ${JSON.stringify(tmp_entries, undefined, "")}`);
        // console.debug(`Selected in filtered = ${selected_in_filter}`);

        // This section effectively acts as an "on resulting list changed callback"
        // Invalidate the known index of any selection before updating the lists.'
        setDisplaySelected(selected_in_filter);
        setKeyboardHoverIdx(undefined);
        setItems(tmp_entries);
        setDsIds(tmp_ds_ids);
    }

    createComputed(filterFunc);

    function looseFocus() {
        const hovered = document.querySelectorAll(":hover");
        console.debug("Dropdown lost focus, mouse hovering the following element");
        console.debug(hovered);
        if (hovered.length === 0)
            return;
        if (!(hovered[hovered.length - 1].classList.contains("ds-item-name") || 
            hovered[hovered.length - 1].classList.contains("ds-expand-icon")) || 
            (hovered[hovered.length - 1].innerHTML == no_search_results_text)) 
        {        
            setDisplayDropdown(false);
            setKeyboardMode(false);
        }
        setKeyboardHoverIdx(undefined);
    }

    function openDropdown() {
        setDisplayDropdown(true);
        setTimeout(updateDropdownPos, 0);
    }

    function dsKeyboardControls(e: KeyboardEvent) {
        switch (e.key) {
            case "Escape":
                if (!displayDropdown()) {
                    (e.target as (HTMLInputElement | null))?.blur();
                    break;
                }
                setKeyboardHoverIdx(undefined);
                setKeyboardMode(false);
                setDisplayDropdown(false);
                break;
            case "Enter": // TODO: UPDATE
                e.preventDefault();

                // Open the dropdown if there is none.
                if (!displayDropdown()) {
                    openDropdown();
                    break;
                }
                setKeyboardMode(true);

                if (!keyboardMode()) {
                    setKeyboardMode(true);
                    break;
                }

                if (allDropdowns === undefined) {break}

                {
                    let item: dropdownEntry | dropdownEntry[] = items();

                    // Check for selecting an item in the dropdown.
                    if ((allDropdowns!.childElementCount > 1) && (selectedIdxs().length > 0)) {
                        item = item[dsIds()[selectedIdxs()[0]]];
                        var prefix = "";
                        for (let i = 1; i < (allDropdowns!.childElementCount - 1); i++) {
                            if (!(item.data instanceof Array)) {break}
                            prefix += `${item.display} | `;
                            item = item.data[selectedIdxs()[i]];
                        }
                        if (!(item.data instanceof Array)) {break}
                        prefix += `${item.display} | `;
                        if (keyboardHoverIdx() === undefined) {
                            if (item.data.length === 1) {
                                item = item.data[0];
                            } else {
                                break;
                            }
                        } else {
                            item = item.data[keyboardHoverIdx()!];
                        }
                    } else {
                        if (keyboardHoverIdx() === undefined) {
                            if (items().length === 1) {
                                item = items()[0];
                            } else {
                                break;
                            }
                        } else {
                            item = items()[keyboardHoverIdx()!]
                        }
                        var prefix = "";
                    }

                    if (!(item.data instanceof Array)) {
                        setSelectedStr(prefix + item.display);
                        set_lambda(item);
                    }
                }

                let sel_idx = 0;
                if (keyboardHoverIdx() !== undefined) {
                    sel_idx = keyboardHoverIdx()!;
                }
                selectIdx((allDropdowns!.childElementCount == 1) ? dsIds()[sel_idx] : sel_idx, allDropdowns!.childElementCount - 1);
                setDisplaySelected(true);
                e.stopPropagation();
                e.preventDefault();

                break;
            case "Tab":
                if (!displayDropdown()) { break }
                setDisplayDropdown(false);
                setKeyboardMode(false);
                break;
            case "ArrowUp":
                {
                    if (!displayDropdown() || !keyboardMode()) { break }

                    const depth = allDropdowns!.childElementCount - 1;
                    if (!(allDropdowns!.children[depth].childElementCount > 0)) { break }
                    e.preventDefault();

                    // "Hover" the bottom element OR above selected if nothing is hovered.
                    if ((keyboardHoverIdx() === undefined)) {
                        const selected_idx = (depth == 0) ? firstSelectedIdx() : selectedIdxs()[depth];

                        if ((selected_idx === undefined) || (selected_idx == 0) || !displaySelected()) {
                            setKeyboardHoverIdx(allDropdowns!.children[depth].childElementCount - 1);
                        } else {
                            // Must be an item selected that is not at the top, hover above that.
                            setKeyboardHoverIdx(selected_idx - 1);
                        }
                        break;
                    }

                    if (keyboardHoverIdx()! > 0) {
                        setKeyboardHoverIdx(keyboardHoverIdx()! - 1);
                    }
                    break;
                }
            case "ArrowDown":
                {
                    if (!displayDropdown() || !keyboardMode()) { break }

                    const depth = allDropdowns!.childElementCount - 1;
                    if (!(allDropdowns!.children[depth].childElementCount > 0)) { break }
                    e.preventDefault();

                    // "Hover" the top element OR above selected if nothing is hovered.
                    if ((keyboardHoverIdx() === undefined)) {
                        const selected_idx = (depth == 0) ? firstSelectedIdx() : selectedIdxs()[depth];

                        if ((selected_idx === undefined) || (selected_idx == (allDropdowns!.children[depth].childElementCount - 1)) || !displaySelected()) {
                            setKeyboardHoverIdx(0);
                        } else {
                            // Must be an item selected that is not at the bottom, hover below that.
                            setKeyboardHoverIdx(selected_idx + 1);
                        }
                        break;
                    }

                    if (keyboardHoverIdx()! < (allDropdowns!.children[depth].childElementCount - 1)) {
                        setKeyboardHoverIdx(keyboardHoverIdx()! + 1);
                    }
                    break;
                }
            case "ArrowLeft":
                if (!keyboardMode() || (allDropdowns === undefined)) {break}
                e.preventDefault();

                if (selectedIdxs().length == 0) {
                    setKeyboardHoverIdx(undefined);
                    break;
                }

                let num_starting = allDropdowns!.childElementCount;
                let prev_idx = selectedIdxs().pop();
                if ((selectedIdxs().length > 0) && (allDropdowns!.childElementCount == num_starting)) {
                    prev_idx = selectedIdxs().pop();
                }
                else if (selectedIdxs().length == 0) {
                    prev_idx = dsIds()[prev_idx!];
                }
                setSelectedIdxs([...selectedIdxs()]);
                setKeyboardHoverIdx(prev_idx);
                break
            case "ArrowRight":
                if (!keyboardMode() || (keyboardHoverIdx() === undefined) || (allDropdowns === undefined)) {break}

                {
                    let item: dropdownEntry | dropdownEntry[] = items();

                    if ((allDropdowns!.childElementCount > 1) && (selectedIdxs().length > 0)) {
                        item = item[dsIds()[selectedIdxs()[0]]];
                        var prefix = "";
                        for (let i = 1; i < (allDropdowns!.childElementCount - 1); i++) {
                            if (!(item.data instanceof Array)) {break}
                            prefix += `${item.display} | `;
                            item = item.data[selectedIdxs()[i]];
                        }
                        if (!(item.data instanceof Array)) {break}
                        prefix += `${item.display} | `;
                        item = item.data[keyboardHoverIdx()!];
                    } else {
                        item = item[keyboardHoverIdx()!]
                        var prefix = "";
                    }

                    if (!(item.data instanceof Array)) {
                        setSelectedStr(prefix + item.display);
                        set_lambda(item);
                    }
                }
                selectIdx((allDropdowns!.childElementCount == 1) ? dsIds()[keyboardHoverIdx()!] : keyboardHoverIdx()!, allDropdowns!.childElementCount - 1);
                setDisplaySelected(true);
                e.stopPropagation();
                e.preventDefault();
                // TODO: Expand to submenu? might need to leave this to enter...
                break;
            default:
                return;
        }

        setTimeout(updateDropdownPos, 0);
        e.stopPropagation();
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

    function selectIdx(i: number, depth: number) {
        console.debug(`SelectIDX: i=${i} depth=${depth}`);
        if (depth > selectedIdxs().length) {
            console.error("Attempted to select Idx at sub_level > (current_deepest_level + 1)");
            return;
        }

        if (depth == selectedIdxs().length) {
            setSelectedIdxs(selectedIdxs().concat(i));
        } else {
            setSelectedIdxs(selectedIdxs().splice(0, depth).concat(i));
        }
        console.debug(`Selected IDXs ${JSON.stringify(selectedIdxs())}`);
    }

    function getSublevels(items: dropdownEntry[], depth: number, prefix: string) {
        const selected_idx_at_depth = (depth == 0) ? firstSelectedIdx() : selectedIdxs()[depth];
        const is_deeper_menu = displaySelected() && (selectedIdxs().length > depth) && (items[selected_idx_at_depth!].data instanceof Array);

        return <>
            <ul class={"ds-sublevel dropdown" + ((keyboardMode() && !is_deeper_menu) ? " ds-keyboard-mode" : "")}
                style="opacity: 0;"
                ref={selfElem => {
                    setTimeout(() => {
                        // Place the dropdown along the x axis.
                        if ((depth > 0) && (selfElem.style.x === "")) {
                            const prev_rect = selfElem.parentElement!.children[depth - 1].getBoundingClientRect();
                            const rect = selfElem.getBoundingClientRect();
                            selfElem.style.left = `${prev_rect.x - rect.x + prev_rect.width}px`;
                        }

                        if (displaySelected() && (selectedIdxs().length > depth)) {
                            conditionalScrollToY(selfElem.children[selected_idx_at_depth!] as HTMLLIElement);
                        }

                        selfElem.style.opacity = "";
                    }, 0);
                }
                }>
                <For each={Object.values(items)}
                    fallback={
                        <li class="ds-item-name ds-nothing-to-display">
                            {no_search_results_text}
                        </li>
                    }>
                    {(item: dropdownEntry, i) => (
                        <li ref={elem => {
                            createEffect(() => {
                                if (!is_deeper_menu && (keyboardHoverIdx() == i())) { conditionalScrollToY(elem) }
                            })
                        }}
                            class={"ds-item-name" +
                                ((displaySelected() && (i() == selected_idx_at_depth)) ? " ds-selected" : "")}
                            style={((!is_deeper_menu && (keyboardHoverIdx() == i())) ? "box-shadow: inset 0 0 0 1px white;" : "") +
                                (((item.data instanceof Array) && (item.data.length == 0)) ? "color: var(--red-color);" : "")}
                            onpointerdown={e => e.preventDefault()}
                            onclick={(e) => {
                                if (!(item.data instanceof Array)) {
                                    setSelectedStr(prefix + item.display);
                                    set_lambda(item);
                                    setDisplayDropdown(false);
                                    setKeyboardMode(false);
                                }
                                selectIdx((depth == 0) ? dsIds()[i()] : i(), depth);
                                setDisplaySelected(true);
                                e.stopPropagation();
                                e.preventDefault();
                            }}
                        >
                            {item.display}
                            <Show when={(item.data instanceof Array) && (item.data.length > 0)}>
                                <img src="icons/caret-down-solid.svg" class="ds-expand-icon" draggable="false" />
                            </Show>
                        </li>
                    )}
                </For>
            </ul>
            <Show when={is_deeper_menu}>
                {getSublevels(items[selected_idx_at_depth!].data as dropdownEntry[], depth + 1, prefix + items[selected_idx_at_depth!].display + " | ")}
            </Show>
        </>
    }

    function updateDropdownPos() {
        if (dropdownSearch === undefined)
            return
        
        let bodyRect = document.body.getClientRects()[0]
        let rect = dropdownSearch.getBoundingClientRect();
        let xDest = rect.x + rect.width;
        let yDest = rect.y;

        if ((allDropdowns !== undefined) && (allDropdowns.childElementCount > 0)) {
            let firstChildRect = allDropdowns.children[0].getBoundingClientRect();
            let lastChildRect = allDropdowns.children[allDropdowns.childElementCount - 1].getBoundingClientRect();
            var dropdownHeight = firstChildRect.height;
            var dropdownWidth = lastChildRect.x - firstChildRect.x + lastChildRect.width;
            xDest = xDest - Math.max(xDest + dropdownWidth - bodyRect.width, 0);
            yDest = yDest - Math.max(yDest + dropdownHeight - bodyRect.height, 0);
            allDropdowns.style = `opacity: 100%; left: ${xDest}px; top: ${yDest}px;`;
        }
    }

    onMount(() => {
        window.addEventListener('resize', updateDropdownPos);
        document.getElementById("overlay")?.addEventListener('scroll', updateDropdownPos);
        setTimeout(() => updateDropdownPos(), 0);
    });

    onCleanup(() => {
        window.removeEventListener('resize', updateDropdownPos);
        document.getElementById("overlay")?.removeEventListener('scroll', updateDropdownPos);
    })

    return (<>
        <div class="dropdown-search" onkeydown={dsKeyboardControls} 
            ref={dropdownSearch}
        >
            <div>
                <input
                    class="ds-search"
                    type="text"
                    onclick={(e) => {
                        e.stopImmediatePropagation();
                        openDropdown(); 
                    }}
                    onFocusIn={openDropdown}
                    onFocusOut={looseFocus}
                    oninput={(e) => {
                        setFilterBy(e.currentTarget.value);
                        if (!displayDropdown()) {
                            openDropdown();
                        } else {
                            setTimeout(updateDropdownPos, 0);
                        }
                    }}
                    placeholder={placeholder}
                /><br />
                <div class="ds-display-selected" title={selectedStr()}>
                    {selectedStr()}
                </div>
            </div>
        </div>

        <Portal mount={document.body}>
            <Show when={displayDropdown()}>
                <div ref={allDropdowns} class="ds-all-dropdowns transparent">
                    {getSublevels(items(), 0, "")}
                </div>
            </Show>
        </Portal>
    </>)
}

export { DropdownSearchL }