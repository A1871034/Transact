interface AccountFE {
    m_id: number,
    m_name: string,
    m_entity_id: number,
    m_entity_name: string,
    m_created: number,
}

interface BareAccountFE {
    m_account_id: number,
    m_account_name: string,
    m_owning_entity_name: string,
}

interface BareEntityFE {
    m_id: number,
    m_name: string,
}

interface BareItemFE {
    m_id: number,
    m_name: string,
    m_unit: string,
}

interface DetailedItemFE {
    m_item: ItemFE,
    m_packaged_items: [PackagedItemFE],
}

interface DetailedTransactionFE {
    m_transaction: TransactionFE,
    m_transfers: [TransferFE],
}

interface EntityFE {
    m_id: number,
    m_name: string,
    m_description: string,
    m_last_transaction: string | undefined,
    m_last_transaction_id: number | undefined,
    m_transactions: number,
    m_delta_value: number,
}

interface ItemFE {
    m_id: number,
    m_name: string,
    m_description: string,
    // m_category_id: number,
    // m_brand_id: number,
    m_created: number,
}

interface PackagedItemFE {
    m_id: number,
    m_qty: number,
    m_unit: string,
    m_units_per_qty: number,
    m_created: number,
}

export enum TransferType {
    Currency = "Currency",
    Item = "Item",
    Asset = "Asset",
    Debt = "Debt",
}

interface TransactionFE {
    m_id: number,
    m_name: string,
    m_description: string,
    m_closed: boolean,
    m_count_transfers: number,
    m_latest_currency_transfer_datetime: number | null,
    m_latest_currency_transfer_id: number | null,
    m_created: number,   
}

interface TransferFE {
    m_transfer_id: number,
    m_type: TransferType,
    m_value: number,
    m_to_id: number,
    m_to_name: string,
    m_from_id: number,
    m_from_name: string,
    m_time: number,
}

export type { 
    AccountFE,
    BareAccountFE,
    BareEntityFE,
    BareItemFE,
    DetailedItemFE,
    DetailedTransactionFE,
    EntityFE, 
    ItemFE,
    PackagedItemFE,
    TransactionFE, 
    TransferFE,
};