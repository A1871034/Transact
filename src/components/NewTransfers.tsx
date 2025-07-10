import { Accessor, createRoot, createSignal, getOwner, JSX } from 'solid-js';
import { invoke } from '@tauri-apps/api/core';

import { BareAccountFE, BareEntityFE, BareItemFE } from '../FrontEndTypes';
import { date_to_db_time } from "../Utils"

import { DropdownSearchL } from './DropdownSearch';

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
    const [searchAccounts, setSearchAccounts] = createSignal<BareAccountFE[]>();

    async function getSearchAccounts() {
        await invoke("get_bare_accounts")
            .then((recv_accounts) => {
                if (recv_accounts instanceof Array) {
                    setSearchAccounts(recv_accounts as BareAccountFE[])
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
    
    getSearchAccounts();
    const toAccountSearch = createRoot((): JSX.Element => {
        return DropdownSearchL("To Account...", searchAccounts, 
            (inp: BareAccountFE) => {
                return inp.m_account_name + " | " + inp.m_owning_entity_name;
            },
            (inp: BareAccountFE) => {
                setToAccId(inp.m_account_id);
            }
        );
    }, getOwner());
    const fromAccountSearch = createRoot((): JSX.Element => {
        return DropdownSearchL("From Account...", searchAccounts as Accessor<BareAccountFE[]>, 
            (inp: BareAccountFE) => {
                return inp.m_account_name + " | " + inp.m_owning_entity_name;
            },
            (inp: BareAccountFE) => {
                setFromAccId(inp.m_account_id);
            }
        );
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
    const [itemId, setItemId] = createSignal<number>();
    const [searchEntities, setSearchEntities] = createSignal<BareEntityFE[]>();
    const [items, setItems] = createSignal<BareItemFE[]>();

    async function getItems() {
        await invoke("get_bare_items")
            .then((recv_items) => {
                if (recv_items instanceof Array) {
                    setItems(recv_items as BareItemFE[])
                    console.debug("received bare items: ", items());           
                } else {
                    throw "Received items are not an array"
                }
            })
            .catch((error) => console.error(error));
    };

    async function getSerachEntities() {
        await invoke("get_bare_entities")
            .then((recv_entities) => {
                if (recv_entities instanceof Array) {
                    setSearchEntities(recv_entities as BareEntityFE[])
                    console.debug("received bare entities: ", searchEntities());           
                } else {
                    throw "Received entities are not an array"
                }
            })
            .catch((error) => console.error(error));
    };

    async function submit() {
        if (itemId() === undefined) {
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
    
    getSerachEntities();
    getItems();
    const toEntitySearch = createRoot((): JSX.Element => {
        return DropdownSearchL("To Account...", searchEntities, 
            (inp: BareEntityFE) => {
                return inp.m_name;
            },
            (inp: BareEntityFE) => {
                setToEntityId(inp.m_id);
            }
        );
    }, getOwner());
    const fromEntitySearch = createRoot((): JSX.Element => {
        return DropdownSearchL("From Account...", searchEntities as Accessor<BareEntityFE[]>, 
            (inp: BareEntityFE) => {
                return inp.m_name;
            },
            (inp: BareEntityFE) => {
                setToEntityId(inp.m_id);
            }
        );
    }, getOwner());
    const itemSearch = createRoot((): JSX.Element => {
        return DropdownSearchL("Item...", items, 
            (inp: BareItemFE) => {
                return inp.m_name;
            },
            (inp: BareItemFE) => {
                setItemId(inp.m_id);
            }
        );
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
                placeholder={`${((items() === undefined) || (itemId() == undefined)) ? "Qty of item..." : items()![itemId()!].m_unit}`}
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