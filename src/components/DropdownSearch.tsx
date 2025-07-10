import '../styles/DropdownSearch.css'

import { Accessor, createComputed, createSignal, For, JSX, Show } from 'solid-js';

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
        if (!hovered[hovered.length - 1].classList.contains("ds-item-name"))
            setDisplayDropdown(false);
        else if (hovered[hovered.length - 1].innerHTML == no_search_results_text) {
            // More effort than it is worth to keep focus on the input (required to prevent ui bugs).
            setDisplayDropdown(false);
        }
    }

    let dropdownRef: HTMLUListElement | undefined;

    function orientDropdown() {
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
    
    createComputed(filterFunc, "");

    return (<>
        <div class="dropdown-search">
            <div>
                <input
                    class="ds-search"
                    type="text"
                    onFocusIn={(e) => {e.preventDefault(); setDisplayDropdown(true); orientDropdown(); setTimeout(() => {e.target.select();}, 0)}}
                    onFocusOut={looseFocus}
                    onkeyup={(e) => {setFilterBy(e.currentTarget.value); orientDropdown()}}
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
                        {(item) => (
                        <li class={"ds-item-name"+((selectedStr() == display_lambda(item)) ? " ds-selected" : "")}
                            onclick={(e) => {
                                e.stopPropagation();
                                setDisplayDropdown(false);
                                setter_lambda(item);
                                setSelectedStr(display_lambda(item));}}
                        >
                            {display_lambda(item)}
                        </li>
                        )}
                    </For>
                </ul>
            </Show>
        </div>
    </>)
}

export { DropdownSearchL }