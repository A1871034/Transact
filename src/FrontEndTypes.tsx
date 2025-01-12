interface AccountFE {
    m_id: number,
    m_name: string,
    m_entity_id: number,
    m_entity_name: string,
    m_added: number,
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

interface TransactionFE {
    m_id: number,
    m_name: string,
    m_description: string,
    m_closed: boolean,
    m_count_transfers: number,
    m_latest_transfer_datetime: number | undefined,
    m_latest_transfer_id: number | undefined,
    m_created: number,
}

interface TransferFE {
    m_transaction_id: number,
    m_transaction_name: string,
    m_transfer_summary: string,
    m_transfer_id: number,
    m_entity_name: string,
    m_entity_id: number,
    m_datetime: string,
}

export type { 
    AccountFE,
    EntityFE, 
    TransactionFE, 
    TransferFE 
};