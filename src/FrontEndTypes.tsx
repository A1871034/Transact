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
    m_last_transaction: string,
    m_last_transaction_id: number,
    m_transactions: number,
    m_delta_value: number,
}

interface TransactionFE {
    m_id: number,
    m_name: string,
    m_description: string,
    m_closed: boolean,
    m_count_transactions: number,
    m_latest_transaction_datetime: string,
    m_latest_transaction_id: number,
    m_created: string,
}

interface TransferFE {
    m_idea_id: number,
    m_idea_name: string,
    m_transaction_summary: string,
    m_transaction_id: number,
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