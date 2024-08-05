// Transaction list endpoint
#[derive(serde::Serialize)]
pub struct TransactionFE {
    m_idea_id: u64,
    m_idea_name: String,
    m_transaction_summary: String,
    m_transaction_id: u64,
    m_entity_name: String,
    m_entity_id: u64,
    m_datetime: String,    
}
fn build_transaction_fe(m_idea_name: &str, 
    m_transaction_summary: &str, m_entity_name: &str,
    m_datetime: &str) -> TransactionFE {
    TransactionFE {
        m_idea_id: 0,
        m_idea_name: m_idea_name.to_string(),
        m_transaction_summary: m_transaction_summary.to_string(),
        m_transaction_id: 0,
        m_entity_name: m_entity_name.to_string(),
        m_entity_id: 0,
        m_datetime: m_datetime.to_string(),
    }
}
#[tauri::command]
pub fn get_transactions() -> Vec<TransactionFE> {
    return vec![
        build_transaction_fe(
            "Payslip",
            "+ $501",
            "Work",
            "5:04PM 28/07/24"
        ),
        build_transaction_fe(
            "Concert",
            "- $88",
            "Ticket Slave",
            "3:01PM 23/06/24",
        ),
        build_transaction_fe(
            "kachow",
            "+ pineapple",
            "Apple",
            "2:00PM 22/06/24",
        ),
        build_transaction_fe(
            "kachow",
            "- melon",
            "Apple",
            "2:00PM 22/06/24",
        ),
    ]
}

// Ideas list endpoint
#[derive(serde::Serialize)]
pub struct IdeaFE {
    m_id: u64,
    m_name: String,
    m_description: String,
    m_closed: bool,
    m_count_transactions: u64,
    m_latest_transaction_datetime: String,
    m_latest_transaction_id: u64,
    m_created: String,   
}
fn build_idea_fe(m_name: &str, 
    m_description: &str, m_closed: bool,
    m_latest_transaction_datetime: &str,
    m_created: &str) -> IdeaFE {
    IdeaFE {
        m_id: 0,
        m_name: m_name.to_string(),
        m_description: m_description.to_string(),
        m_closed,
        m_count_transactions: 2,
        m_latest_transaction_datetime: m_latest_transaction_datetime.to_string(),
        m_latest_transaction_id: 0,
        m_created: m_created.to_string(), 
    }
}
#[tauri::command]
pub fn get_ideas() -> Vec<IdeaFE> {
    return vec![
        build_idea_fe(
            "Payslip",
            "getting paid for the work",
            true,
            "5:04PM 28/07/24",
            "5:04PM 28/07/24",
        ),
        build_idea_fe(
            "Concert",
            "buy tickets for me and another to that concert that is some time in the future",
            false,
            "3:01PM 23/06/24",
            "5:27PM 24/06/24",
        ),
        build_idea_fe(
            "kachow",
            "a very epic trade at the apple store",
            true,
            "2:00PM 22/06/24",
            "3:01PM 25/06/24",
        ),
    ]
} 

// Entities list endpoint
#[derive(serde::Serialize)]
pub struct EntityFE {
    m_id: u64,
    m_name: String,
    m_description: String,
    m_last_transaction: String,
    m_last_transaction_id: u64,
    m_transactions: u64,
    m_delta_value: i64,
}
fn build_entity_fe(m_name: &str, 
    m_description: &str,
    m_last_transaction: &str,
    m_delta_value: i64) -> EntityFE {
    EntityFE {
        m_id: 0,
        m_name: m_name.to_string(),
        m_description: m_description.to_string(),
        m_last_transaction: m_last_transaction.to_string(),
        m_last_transaction_id: 0,
        m_transactions: 3,
        m_delta_value,
    }
}
#[tauri::command]
pub fn get_entities() -> Vec<EntityFE> {
    return vec![
        build_entity_fe(
            "Work",
            "Not mcdonalds",
            "5:04PM 28/07/24",
            501,
        ),
        build_entity_fe(
            "Ticket Slave",
            "The online platform for purchasing tickets for local concerts, gigs, etc.",
            "3:01PM 23/06/24",
            -88,
        ),
        build_entity_fe(
            "Apple",
            "A store selling exclusively apples, not to be confused with the Apple tm store",
            "2:00PM 22/06/24",
            -2,
        ),
    ]
}