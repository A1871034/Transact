use crate::DbConnection;
use rusqlite::Result;
use tauri::State;

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
#[derive(Debug)]
pub struct EntityFE {
    m_id: u64,
    m_name: String,
    m_description: String,
    m_last_transaction: String,
    m_last_transaction_id: u64,
    m_transactions: u64,
    m_delta_value: i64,
}

fn db_get_entities(dbconn: State<DbConnection>) -> Result<Vec<EntityFE>, Box<dyn std::error::Error>> {
    let locked = dbconn.conn.lock().unwrap();
    let mut stmt = locked.prepare_cached(
        "SELECT id, name, description FROM entities")?;
    let raw_entities = stmt.query_map([], |row| {
        Ok(EntityFE {
            m_id: row.get(0)?,
            m_name: row.get(1)?,
            m_description: row.get(2)?,
            m_last_transaction: String::from("last_tx"),
            m_last_transaction_id: 0,
            m_transactions: 0,
            m_delta_value: 0,
        })
    })?;
    let entities: Vec<EntityFE> = raw_entities.map(|result_entity| {
        result_entity.unwrap()
    }).collect();
    Ok(entities)
}

// Entities list endpoint
#[derive(serde::Serialize)]
#[derive(Debug)]
pub struct BareEntityFE {
    m_id: u64,
    m_name: String,
}

fn db_get_bare_entities(dbconn: State<DbConnection>) -> Result<Vec<BareEntityFE>, Box<dyn std::error::Error>> {
    let locked = dbconn.conn.lock().unwrap();
    let mut stmt = locked.prepare_cached(
        "SELECT id, name FROM entities")?;
    let raw_entities = stmt.query_map([], |row| {
        Ok(BareEntityFE {
            m_id: row.get(0)?,
            m_name: row.get(1)?,
        })
    })?;
    let entities: Vec<BareEntityFE> = raw_entities.map(|result_entity| {
        result_entity.unwrap()
    }).collect();
    Ok(entities)
}
    
#[tauri::command]
pub fn get_bare_entities(dbconn: State<DbConnection>) -> Result<Vec<BareEntityFE>, String> {
    println!("Recieved: get_entities");
    let res = db_get_bare_entities(dbconn);
    res.map_err(|err| {
        err.to_string()
    })
}

#[tauri::command]
pub fn get_entities(dbconn: State<DbConnection>) -> Result<Vec<EntityFE>, String> {
    println!("Recieved: get_entities");
    let res = db_get_entities(dbconn);
    res.map_err(|err| {
        err.to_string()
    })
}

#[derive(serde::Serialize)]
#[derive(Debug)]
pub struct AccountFE {
    m_id: u64,
    m_name: String,
    m_entity_id: u64,
    m_entity_name: String,
}

fn db_get_accounts(dbconn: State<DbConnection>) -> Result<Vec<AccountFE>, Box<dyn std::error::Error>> {
    let lock = dbconn.conn.lock().unwrap();
    let mut stmt = lock.prepare_cached(
        "SELECT ea.id, ea.name, ea.entity_id, e.name FROM entity_accounts ea INNER JOIN entities e ON e.id = ea.entity_id;"
    )?;
    let raw_accounts = stmt.query_map([], |row| {
        Ok(AccountFE {
            m_id: row.get(0)?,
            m_name: row.get(1)?,
            m_entity_id: row.get(2)?,
            m_entity_name: row.get(3)?,
        })
    })?;
    let accounts: Vec<AccountFE> = raw_accounts.map(|result_account| {
        result_account.unwrap()
    }).collect();
    Ok(accounts)
}

#[tauri::command]
pub fn get_accounts(dbconn: State<DbConnection>) -> Result<Vec<AccountFE>, String> {
    println!("Recieved: get_accounts");
    db_get_accounts(dbconn)
    .map_err(|err| err.to_string())
}