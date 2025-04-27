import { Accessor, createRoot, createSignal, getOwner, JSX } from 'solid-js';
import { invoke } from '@tauri-apps/api/core';

import { BareAccountFE } from '../FrontEndTypes';
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

    // function getNewTransferFE(new_transfer_id: number): TransferFE {
    //     let to_account = searchAccounts()?.find((item) => {item.m_account_id == toAccId()})
    //     let from_account = searchAccounts()?.find((item) => {item.m_account_id == fromAccId()})
    //     let tmp: TransferFE = {
    //         m_transfer_id: new_transfer_id,
    //         m_type: TransferType.Currency,
    //         m_value: amount(),
    //         m_to_id: to_account!.,
    //         m_to_name to_account!.,
    //         m_from_id ,
    //         m_from_name,
    //         m_time: date_to_db_time(new Date(date() + " " + time())),
    //     }
    //     return {};
    // }

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
        
        console.log(datetime);
        date_to_db_time(datetime);
        
        console.log(amount());
        
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


export { NewCurrencyTransfer };