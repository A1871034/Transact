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
                            data: acc.m_account_id, 
                            hover: undefined
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
        return DropdownSearchL("To Account...", searchAccounts, setToAccId as Setter<number>);
    }, getOwner());
    const fromAccountSearch = createRoot((): JSX.Element => {
        return DropdownSearchL("From Account...", searchAccounts, setFromAccId as Setter<number>);
    }, getOwner());

    return createRoot((): JSX.Element => { return (
    <form class="flex-row" onSubmit={(e) => { e.preventDefault(); submit() }}>
        <div>
            <div>
                <label for="amount">Amount: </label>
                <input
                    id="amount"
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
                <label for="date">Date: </label>
                <input
                    id="date"
                    type="Date"
                    min="1970-01-01"
                    onChange={(e) => setDate(e.currentTarget.value)}
                    required
                    />
            </div>
            <br/>
            <div>
                <label for="time">Time: </label>
                <input
                    id="time"
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
    const [amount, setAmount] = createSignal(-1);
    const [time, setTime] = createSignal<string>();
    const [date, setDate] = createSignal<string>();
    const [toEntityId, setToEntityId] = createSignal<number>();
    const [fromEntityId, setFromEntityId] = createSignal<number>();
    const [packagedItemId, setPackagedItemId] = createSignal<number>();

    const [searchEntities, setSearchEntities] = createSignal<dropdownEntry[]>();
    const [allItemPackagings, setAllItemPackagings] = createSignal<dropdownEntry[]>();

    async function getSearchEntities() {
        await invoke("get_bare_entities")
            .then((recv_entities) => {
                if (recv_entities instanceof Array) {
                    setSearchEntities((recv_entities as BareEntityFE[]).map<dropdownEntry>(
                        (entity) => {return {
                            display: entity.m_name,
                            data: entity.m_id,
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
                            display: `${packed.m_qty} - ${packed.m_units_per_qty}${packed.m_unit}`,
                            data: packed.m_id,
                            hover: undefined,
                        }}),
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
        
        console.log(amount());
        
        try {
            let res:number = await invoke("submit_new_item_transfer", {
                amount: amount(),
                toAccountId: toEntityId()!,
                fromAccountId: fromEntityId()!,
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
        return DropdownSearchL("To Account...", searchEntities, setToEntityId as Setter<number>);
    }, getOwner());
    const fromEntitySearch = createRoot((): JSX.Element => {
        return DropdownSearchL("From Account...", searchEntities, setFromEntityId as Setter<number>);
    }, getOwner());
    const itemSearch = createRoot((): JSX.Element => {
        return DropdownSearchL("Item...", allItemPackagings, setPackagedItemId as Setter<number>);
    }, getOwner());

    return createRoot((): JSX.Element => { return (
    <form class="flex-row" onSubmit={(e) => { e.preventDefault(); submit() }}>
        <div>
            {itemSearch}
            <br/>
            <label for="qty">Quantity: </label>
            <input
                id="qty"
                type="number"
                step="0.000000001"
                onChange={(e) => setAmount(Number(e.currentTarget.value))}
                placeholder={`${((allItemPackagings() === undefined) || (packagedItemId() == undefined)) ? "Qty of item..." : "" /*allItemPackagings()![itemId()!].m_item.*/}`}
                // disabled={((items() === undefined) || (itemId() == undefined)) ? true : false}
                class="rm-spinner"
                required
                autofocus
                />
        </div>
        <div>
            <div>
                <label for="date">Date: </label>
                <input
                    id="date"
                    type="Date"
                    min="1970-01-01"
                    onChange={(e) => setDate(e.currentTarget.value)}
                    required
                    />
            </div>
            <br/>
            <div>
                <label for="time">Time: </label>
                <input
                    id="time"
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