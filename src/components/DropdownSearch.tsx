import '../styles/DropdownSearch.css'

import { Accessor, createComputed, createSignal, For, JSX } from 'solid-js';

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
        <div class="tableWrap dropdown">
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
                </tbody>
            </table>
        </div>
    )
}

export { DropdownSearch }