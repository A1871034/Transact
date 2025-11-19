use std::collections::HashMap;

use crate::DbConnection;
use rusqlite::Result;
use tauri::State;

#[derive(serde::Serialize)]
enum TransferType {
    Currency,
    Item,
    // Asset,
    // Debt,
}
// Transaction list endpoint
#[derive(serde::Serialize)]
pub struct TransferFE {
    m_transfer_id: u64,
    m_type: TransferType,
    m_value: f64,
    m_to_id: u64,
    m_to_name: String,
    m_from_id: u64,
    m_from_name: String,
    m_time: u64,
}

#[tauri::command]
pub fn get_transfers() -> Vec<TransferFE> {
    vec![]
}

// Ideas list endpoint
#[derive(serde::Serialize)]
pub struct TransactionFE {
    m_id: u64,
    m_name: String,
    m_description: String,
    m_closed: bool,
    m_count_transfers: u64,
    m_latest_currency_transfer_datetime: Option<u64>,
    m_latest_currency_transfer_id: Option<u64>,
    m_created: u64,   
}

#[derive(serde::Serialize)]
pub struct DetailedTransactionFE {
    m_transaction: TransactionFE,
    m_transfers: Vec<TransferFE>,
}

fn db_get_transactions(dbconn: State<DbConnection>) -> Result<Vec<TransactionFE>, Box<dyn std::error::Error>> {
    let locked = dbconn.conn.lock().unwrap();
    let mut stmt = locked.prepare_cached(
        "SELECT id, name, description, closed, added FROM transactions")?;
    let raw_transactions = stmt.query_map([], |row| {
        Ok(TransactionFE {
            m_id: row.get(0)?,
            m_name: row.get(1)?,
            m_description: row.get(2)?,
            m_closed: row.get(3)?,
            m_created: row.get(4)?,
            m_count_transfers: 0,
            m_latest_currency_transfer_datetime: None,
            m_latest_currency_transfer_id: None,
        })
    })?;
    let transactions: Vec<TransactionFE> = raw_transactions.map(|result_transaction| {
        result_transaction.unwrap()
    }).collect();
    Ok(transactions)
}

fn db_get_transaction(transaction_id: u64, dbconn: State<DbConnection>) -> Result<DetailedTransactionFE, Box<dyn std::error::Error>> {
    let locked = dbconn.conn.lock().unwrap();
    let mut stmt = locked.prepare_cached(
        "SELECT id, name, description, closed, added FROM transactions WHERE id = ?1 LIMIT 1")?;
    let tranasction = stmt.query_row([transaction_id], |row| { Ok(TransactionFE{
        m_id: row.get(0)?,
            m_name: row.get(1)?,
            m_description: row.get(2)?,
            m_closed: row.get(3)?,
            m_created: row.get(4)?,
            m_count_transfers: 0,
            m_latest_currency_transfer_datetime: None,
            m_latest_currency_transfer_id: None,
    })})?;

    // Get Currency Transfers.
    stmt = locked.prepare_cached(
        "SELECT ct.id, ct.amount, e_to.id, e_to.name, e_from.id, e_from.name, ct.time 
        FROM (SELECT * FROM currency_transfer_transaction_link cttl WHERE cttl.transaction_id = ?1) cttl
        INNER JOIN currency_transfers ct ON cttl.transfer_id = ct.id
        INNER JOIN entity_accounts ea_to ON ct.to_account = ea_to.id
        INNER JOIN entity_accounts ea_from ON ct.from_Account = ea_from.id
        INNER JOIN entities e_to ON ea_to.entity_id = e_to.id
        INNER JOIN entities e_from ON ea_from.entity_id = e_from.id
        ORDER BY ct.time DESC, ct.amount DESC, e_to.name ASC"
    )?;
    let raw_transfers = stmt.query_map([transaction_id], |row| {
        Ok(TransferFE {
            m_transfer_id: row.get(0)?,
            m_type: TransferType::Currency,
            m_value: row.get(1)?,
            m_to_id: row.get(2)?,
            m_to_name: row.get(3)?,
            m_from_id: row.get(4)?,
            m_from_name: row.get(5)?,
            m_time: row.get(6)?,
        })
    })?;
    let mut transfers: Vec<TransferFE> = raw_transfers.map(|transfer| {
        transfer.unwrap()
    }).collect();

    // Get Item Transfers.
    stmt = locked.prepare_cached(
        "SELECT it.id, it.qty * it.per_qty_constituent_cost, e_to.id, e_to.name, e_from.id, e_from.name, it.time 
        FROM (SELECT * FROM item_transfer_transaction_link ittl WHERE ittl.transaction_id = ?1) ittl
        INNER JOIN item_transfers it ON ittl.transfer_id = it.id
        INNER JOIN entities e_to ON it.to_entity_id = e_to.id
        INNER JOIN entities e_from ON it.from_entity_id = e_from.id
        ORDER BY it.time DESC, it.qty DESC, e_to.name ASC"
    )?;
    let raw_transfers = stmt.query_map([transaction_id], |row| {
        Ok(TransferFE {
            m_transfer_id: row.get(0)?,
            m_type: TransferType::Item,
            m_value: row.get(1)?,
            m_to_id: row.get(2)?,
            m_to_name: row.get(3)?,
            m_from_id: row.get(4)?,
            m_from_name: row.get(5)?,
            m_time: row.get(6)?,
        })
    })?;
    transfers.extend(raw_transfers.map(|transfer| {
        transfer.unwrap()
    }));

    Ok(DetailedTransactionFE { m_transaction: tranasction, m_transfers: transfers })
}

#[tauri::command]
pub fn get_transaction(transaction_id: u64, dbconn: State<DbConnection>) -> Result<DetailedTransactionFE, String> {
    println!("Get: Transaction id={}", transaction_id);
    db_get_transaction(transaction_id, dbconn)
    .map_err(|err| err.to_string())
} 

#[tauri::command]
pub fn get_transactions(dbconn: State<DbConnection>) -> Result<Vec<TransactionFE>, String> {
    println!("Get: Transactions");
    let res = db_get_transactions(dbconn);
    res.map_err(|err| {
        err.to_string()
    })
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
    println!("Get: bare_entities");
    let res = db_get_bare_entities(dbconn);
    res.map_err(|err| {
        err.to_string()
    })
}

#[tauri::command]
pub fn get_entities(dbconn: State<DbConnection>) -> Result<Vec<EntityFE>, String> {
    println!("Get: entities");
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
    m_created: u64,
}

fn db_get_accounts(dbconn: State<DbConnection>) -> Result<Vec<AccountFE>, Box<dyn std::error::Error>> {
    let lock = dbconn.conn.lock().unwrap();
    let mut stmt = lock.prepare_cached(
        "SELECT ea.id, ea.name, ea.entity_id, e.name, ea.added FROM entity_accounts ea INNER JOIN entities e ON e.id = ea.entity_id ORDER BY e.name ASC, ea.name ASC;"
    )?;
    let raw_accounts = stmt.query_map([], |row| {
        Ok(AccountFE {
            m_id: row.get(0)?,
            m_name: row.get(1)?,
            m_entity_id: row.get(2)?,
            m_entity_name: row.get(3)?,
            m_created: row.get(4)?,
        })
    })?;
    let accounts: Vec<AccountFE> = raw_accounts.map(|result_account| {
        result_account.unwrap()
    }).collect();
    Ok(accounts)
}

#[tauri::command]
pub fn get_accounts(dbconn: State<DbConnection>) -> Result<Vec<AccountFE>, String> {
    println!("Get: accounts");
    db_get_accounts(dbconn)
    .map_err(|err| err.to_string())
}

// Accounts list endpoint
#[derive(serde::Serialize)]
#[derive(Debug)]
pub struct BareAccountFE {
    m_account_id: u64,
    m_account_name: String,
    m_owning_entity_name: String,
}

fn db_get_bare_accounts(dbconn: State<DbConnection>) -> Result<Vec<BareAccountFE>, Box<dyn std::error::Error>> {
    let locked = dbconn.conn.lock().unwrap();
    let mut stmt = locked.prepare_cached(
        "SELECT ea.id, ea.name, e.name FROM entity_accounts ea INNER JOIN entities e ON ea.entity_id = e.id")?;
    let raw_entities = stmt.query_map([], |row| {
        Ok(BareAccountFE {
            m_account_id: row.get(0)?,
            m_account_name: row.get(1)?,
            m_owning_entity_name: row.get(2)?,
        })
    })?;
    let entities: Vec<BareAccountFE> = raw_entities.map(|result_entity| {
        result_entity.unwrap()
    }).collect();
    Ok(entities)
}
    
#[tauri::command]
pub fn get_bare_accounts(dbconn: State<DbConnection>) -> Result<Vec<BareAccountFE>, String> {
    println!("Get: bare_accounts");
    let res = db_get_bare_accounts(dbconn);
    res.map_err(|err| {
        err.to_string()
    })
}

// Items list endpoint
#[derive(serde::Serialize)]
#[derive(Debug)]
pub struct ItemFE {
    m_id: u64,
    m_name: String,
    m_description: String,
    // m_category_id: u64,
    // m_brand_id: u64,
    m_created: u64,
}

#[tauri::command]
pub fn get_items(dbconn: State<DbConnection>) -> Result<Vec<ItemFE>, String> {
    println!("Get: items");
    let res = db_get_items(dbconn);
    res.map_err(|err| {
        err.to_string()
    })
}

fn db_get_items(dbconn: State<DbConnection>) -> Result<Vec<ItemFE>, Box<dyn std::error::Error>> {
    let lock = dbconn.conn.lock().unwrap();
    let mut stmt = lock.prepare_cached(
        "SELECT i.id, i.name, i.description, i.added FROM items i;"
    )?;
    let raw_items = stmt.query_map([], |row| {
        Ok(ItemFE {
            m_id: row.get(0)?,
            m_name: row.get(1)?,
            m_description: row.get(2)?,
            m_created: row.get(3)?,
        })
    })?;
    let items: Vec<ItemFE> = raw_items.map(|result_account| {
        result_account.unwrap()
    }).collect();
    Ok(items)
}

#[derive(serde::Serialize)]
#[derive(Debug)]
struct PackagedItemFE {
    m_id: u64,
    m_qty: u64,
    m_unit: String,
    m_units_per_qty: f64,
    m_created: u64,
}

// Items list endpoint
#[derive(serde::Serialize)]
#[derive(Debug)]
pub struct DetailedItemFE {
    m_item: ItemFE,
    m_packaged_items: Vec<PackagedItemFE>,
}

fn db_get_item(item_id: u64, dbconn: State<DbConnection>) -> Result<DetailedItemFE, Box<dyn std::error::Error>> {
    let locked = dbconn.conn.lock().unwrap();
    let mut stmt = locked.prepare_cached(
        "SELECT id, name, description, added FROM items WHERE id = ?1 LIMIT 1")?;
    let item = stmt.query_row([item_id], |row| { Ok(ItemFE{
        m_id: row.get(0)?,
        m_name: row.get(1)?,
        m_description: row.get(2)?,
        m_created: row.get(3)?,
    })})?;
    stmt = locked.prepare_cached(
        "SELECT p.id, p.qty, p.unit, p.units_per_qty, p.added FROM packaged_item p WHERE p.item_id = ?1"
    )?;
    let raw_transfers = stmt.query_map([item_id], |row| {
        Ok(PackagedItemFE {
            m_id: row.get(0)?,
            m_qty: row.get(1)?,
            m_unit: row.get(2)?,
            m_units_per_qty: row.get(3)?,
            m_created: row.get(4)?,
        })
    })?;
    let packaged_items: Vec<PackagedItemFE> = raw_transfers.map(|transfer| {
        transfer.unwrap()
    }).collect();
    Ok(DetailedItemFE { m_item: item, m_packaged_items: packaged_items })
}

#[tauri::command]
pub fn get_item(item_id: u64, dbconn: State<DbConnection>) -> Result<DetailedItemFE, String> {
    println!("Get: Item id={}", item_id);
    db_get_item(item_id, dbconn)
    .map_err(|err| err.to_string())
} 

// Packaged items list endpoint

#[tauri::command]
pub fn get_all_packaged_items(dbconn: State<DbConnection>) -> Result<Vec<DetailedItemFE>, String> {
    println!("Get: All packaged items");
    let res = db_get_all_packaged_items(dbconn);
    res.map_err(|err| {
        err.to_string()
    })
}

fn db_get_all_packaged_items(dbconn: State<DbConnection>) -> Result<Vec<DetailedItemFE>, Box<dyn std::error::Error>> {
    let items: Vec<DetailedItemFE>;
    let mut packagings: HashMap<u64, Vec<PackagedItemFE>> = HashMap::new();

    {
        let lock = dbconn.conn.lock().unwrap();
        let mut stmt = lock.prepare_cached(
            "SELECT p.item_id, p.id, p.qty, p.unit, p.units_per_qty, p.added FROM packaged_item p"
        )?;
        let raw_packagings = stmt.query_map([], |row| {
            Ok((row.get::<usize, u64>(0)?, PackagedItemFE {
                m_id: row.get(1)?,
                m_qty: row.get(2)?,
                m_unit: row.get(3)?,
                m_units_per_qty: row.get(4)?,
                m_created: row.get(5)?,
            }))
        })?;

        for packaging in raw_packagings {
            let packaging = packaging?; 
            packagings.entry(packaging.0).or_default().push(packaging.1);
        }
        println!("MAP: {:?}", packagings);
        stmt = lock.prepare_cached(
            "SELECT id, name, description, added FROM items ORDER BY name ASC")?;
            let raw_items = stmt.query_map([], |row| { Ok(ItemFE{
                m_id: row.get(0)?,
                m_name: row.get(1)?,
                m_description: row.get(2)?,
                m_created: row.get(3)?,
            })})?;
        items = raw_items.map(|item| {
            let item = item.unwrap();
            println!("ITEM: {:?}", item);
            DetailedItemFE {m_packaged_items: packagings.remove(&item.m_id).unwrap_or(Vec::new()), m_item: item }
        }).collect();
    }

    Ok(items)
}
