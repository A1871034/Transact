import { Accessor, createEffect, createRoot, createSignal, getOwner, JSX, Setter } from 'solid-js';
import { invoke } from '@tauri-apps/api/core';

import { BareAccountFE, BareEntityFE, BareItemFE, DetailedItemFE, PackagedItemFE } from '../FrontEndTypes';
import { date_to_db_time } from "../Utils"

import { DropdownSearchL, dropdownEntry } from './DropdownSearch';

function NewCurrencyTransfer(
    transaction_id: number, 
    callback: ((new_transfer_id: number) => void) = () => {}
    ): JSX.Element 
{
    const [amount, setAmount] = createSignal(-1);
    const [time, setTime] = createSignal<string>();
    const [date, setDate] = createSignal<string>();
    const [toAccId, setToAccId] = createSignal<number>();
    const [fromAccId, setFromAccId] = createSignal<number>();
    const [searchAccounts, setSearchAccounts] = createSignal<dropdownEntry[]>();

    async function getSearchAccounts() {
        await invoke("get_bare_accounts")
            .then((recv_accounts) => {
                if (recv_accounts instanceof Array) {
                    setSearchAccounts((recv_accounts as BareAccountFE[]).map(
                        acc => {return {
                            display: acc.m_account_name + " | " + acc.m_owning_entity_name,
                            data: undefined,
                            data_onset: acc.m_account_id,
                            hover: undefined,
                        }}
                    ));
                    console.debug("received bare accounts: ", searchAccounts());           
                } else {
                    throw "Received accounts are not an array"
                }
            })
            .catch((error) => console.error(error));
    };

    async function submit() {
        if ((toAccId() === undefined) || (fromAccId() == undefined)) {
            alert("Select a to and from account");
            return;
        }
        
        if ((toAccId() === fromAccId())) {
            alert("To and from accounts cannot be the same");
            return;
        }
        
        const datetime = new Date(date() + " " + time());
        
        try {
            let res:number = await invoke("submit_new_currency_transfer", {
                amount: amount(),
                toAccountId: toAccId()!,
                fromAccountId: fromAccId()!,
                time: date_to_db_time(datetime),
                transactionId: transaction_id
            });
            console.debug("Status submit_new_currency_transfer <= currency_transfer_id ", res);
            callback(res);
        } catch (error) {
            console.log("Failed to submit: " + error);
            alert("Failed to submit.");
        }
    }
    Promise<dropdownEntry[]>
    getSearchAccounts();
    const toAccountSearch = createRoot((): JSX.Element => {
        return DropdownSearchL("To Account...", searchAccounts, (de: dropdownEntry) => setToAccId(de.data_onset));
    }, getOwner());
    const fromAccountSearch = createRoot((): JSX.Element => {
        return DropdownSearchL("From Account...", searchAccounts, (de: dropdownEntry) => setFromAccId(de.data_onset));
    }, getOwner());

    return createRoot((): JSX.Element => { return (
    <form class="flex-row" onSubmit={(e) => { e.preventDefault(); submit() }}>
        <div>
            <div>
                <input
                    id="amount"
                    title="Amount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    onChange={(e) => setAmount(Number(e.currentTarget.value))}
                    placeholder="Transfered amount..."
                    required
                    autofocus
                    />
            </div>
            <br/>
            <div>
                <input
                    id="date"
                    title="Date"
                    type="Date"
                    min="1970-01-01"
                    onChange={(e) => setDate(e.currentTarget.value)}
                    required
                    />
            </div>
            <br/>
            <div>
                <input
                    id="time"
                    title="Time"
                    type="Time"
                    onChange={(e) => setTime(e.currentTarget.value)}
                    required
                    />
            </div>
            <br/>
        </div>
        <div>
            {toAccountSearch}
            <br/>
            {fromAccountSearch}
        </div>
        <button type="submit"><h2>Submit</h2></button>
    </form>
    ) }, getOwner());
}


function NewItemTransfer(
    transaction_id: number, 
    callback: ((new_transfer_id: number) => void) = () => {}
    ): JSX.Element 
{
    const [qty, setQty] = createSignal(-1);
    const [qtyCost, setQtyCost] = createSignal(-1);
    const [time, setTime] = createSignal<string>();
    const [date, setDate] = createSignal<string>();
    const [toEntityId, setToEntityId] = createSignal<number>();
    const [fromEntityId, setFromEntityId] = createSignal<number>();
    const [packagedItemId, setPackagedItemId] = createSignal<number>();
    const [selectedPackaging, setSelectedPackaging] = createSignal("");

    const [searchEntities, setSearchEntities] = createSignal<dropdownEntry[]>();
    const [allItemPackagings, setAllItemPackagings] = createSignal<dropdownEntry[]>();

    async function getSearchEntities() {
        await invoke("get_bare_entities")
            .then((recv_entities) => {
                if (recv_entities instanceof Array) {
                    setSearchEntities((recv_entities as BareEntityFE[]).map<dropdownEntry>(
                        (entity) => {return {
                            display: entity.m_name,
                            data: undefined,
                            data_onset: entity.m_id,
                            hover: undefined,
                        }}
                    ));
                    console.debug("received bare entities: ", searchEntities());           
                } else {
                    throw "Received entities are not an array"
                }
            })
            .catch((error) => console.error(error));
    };

    async function getAllItemPackagings() {
        await invoke("get_all_packaged_items")
            .then((recv) => {
                if (recv instanceof Array) {
                    setAllItemPackagings((recv as DetailedItemFE[]).map<dropdownEntry>((inp) => {return {
                        display: inp.m_item.m_name,
                        data: inp.m_packaged_items.map<dropdownEntry>((packed: PackagedItemFE) => {return {
                            display: `${packed.m_qty}x ${packed.m_units_per_qty}${packed.m_unit}`,
                            data: undefined,
                            data_onset: packed.m_id,
                            hover: undefined,
                        }}),
                        data_onset: undefined,
                        hover: `${inp.m_packaged_items.length} packagings`,
                    }}))
                    console.debug("received all item packagings: ", allItemPackagings());           
                } else {
                    throw "Received data is not an array"
                }
            })
            .catch((error) => console.error(error));
    };

    async function submit() {
        if (packagedItemId() === undefined) {
            alert("Please select an item");
            return;
        }

        if ((toEntityId() === undefined) || (fromEntityId() == undefined)) {
            alert("Select a to and from account");
            return;
        }
        
        if ((toEntityId() === fromEntityId())) {
            alert("To and from accounts cannot be the same");
            return;
        }
        
        const datetime = new Date(date() + " " + time());
        
        console.log(datetime);
        date_to_db_time(datetime);
        
        console.log(qty());
        
        try {
            let res:number = await invoke("submit_new_item_transfer", {
                qty: qty(),
                perQtyConstituentCost: qtyCost(),
                packagingId: packagedItemId(),
                toEntityId: toEntityId()!,
                fromEntityId: fromEntityId()!,
                time: date_to_db_time(datetime),
                transactionId: transaction_id
            });
            console.debug("Status submit_new_item_transfer <= currency_transfer_id ", res);
            callback(res);
        } catch (error) {
            console.log("Failed to submit: " + error);
            alert("Failed to submit.");
        }
    }
    
    getAllItemPackagings();
    getSearchEntities();
    const toEntitySearch = createRoot((): JSX.Element => {
        return DropdownSearchL("To Entity...", searchEntities, (de: dropdownEntry) => setToEntityId(de.data_onset));
    }, getOwner());
    const fromEntitySearch = createRoot((): JSX.Element => {
        return DropdownSearchL("From Entity...", searchEntities, (de: dropdownEntry) => setFromEntityId(de.data_onset));
    }, getOwner());
    const itemSearch = createRoot((): JSX.Element => {
        return DropdownSearchL("Item...", allItemPackagings, (de: dropdownEntry) => {setPackagedItemId(de.data_onset); setSelectedPackaging(de.display)});
    }, getOwner());

    return createRoot((): JSX.Element => { return (
    <form class="flex-row" onSubmit={(e) => { e.preventDefault(); submit() }}>
        <div>
            {itemSearch}
            <br/>
            <input
                id="qty"
                title={((allItemPackagings() === undefined) || (packagedItemId() == undefined)) ? "Qty of Packages" : `Qty of (${selectedPackaging()})s`}
                type="number"
                step="1"
                onChange={(e) => setQty(Number(e.currentTarget.value))}
                placeholder={((allItemPackagings() === undefined) || (packagedItemId() == undefined)) ? "Qty of Packages" : `Qty of (${selectedPackaging()})s`}
                // disabled={((items() === undefined) || (itemId() == undefined)) ? true : false}
                class="rm-spinner"
                required
                autofocus
                />
            <br/>
            <input
                id="cost"
                title="Cost per packaging"
                type="number"
                step="0.0000001"
                onChange={(e) => setQtyCost(Number(e.currentTarget.value))}
                placeholder="$ per Package"
                // disabled={((items() === undefined) || (itemId() == undefined)) ? true : false}
                class="rm-spinner"
                required
            />
        </div>
        <div>
            <div>
                <input
                    id="date"
                    title="Date"
                    type="Date"
                    min="1970-01-01"
                    onChange={(e) => setDate(e.currentTarget.value)}
                    required
                    />
            </div>
            <br/>
            <div>
                <input
                    id="time"
                    title="Time"
                    type="Time"
                    onChange={(e) => setTime(e.currentTarget.value)}
                    required
                    />
            </div>
            <br/>
        </div>
        <div>
            {toEntitySearch}
            <br/>
            {fromEntitySearch}
        </div>
        <button type="submit"><h2>Submit</h2></button>
    </form>
    ) }, getOwner());
}


export { NewCurrencyTransfer, NewItemTransfer };