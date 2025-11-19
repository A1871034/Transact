use crate::DbConnection;
use rusqlite::{Connection, Transaction};
use std::sync::MutexGuard;
use tauri::State;

struct LastInsertRowIdT {
    rowid: u64,
}

fn db_get_last_insert_rowid(tx: &Transaction) -> Result<u64, Box<dyn std::error::Error>> {
    let mut stmt = tx.prepare("SELECT last_insert_rowid()")?;
    let rows = stmt.query_row([], |row| Ok(LastInsertRowIdT {rowid: row.get(0)?}))?;
    Ok(rows.rowid)
}

fn db_submit_new_entity(name: &str, description: &str, dbconn: State<DbConnection>) -> Result<u64, Box<dyn std::error::Error>>{
    let mut lock = dbconn.conn.lock().unwrap();
    let tx = lock.transaction()?;
    tx.execute(
        "INSERT INTO entities (name, description) VALUES (?1, ?2)", 
        [name, description])?;
    let rowid = db_get_last_insert_rowid(&tx)?;
    tx.execute(
        "INSERT INTO entity_accounts (entity_id, name) VALUES (?1, 'unspecified')", 
        [rowid])?;
    tx.commit()?;
    Ok(rowid)
}

fn db_submit_new_account(name: &str, entity_id: u64, dbconn: State<DbConnection>) -> Result<u64, Box<dyn std::error::Error>>{
    let mut lock = dbconn.conn.lock().unwrap();
    let tx = lock.transaction()?;
    tx.execute(
        "INSERT INTO entity_accounts (entity_id, name) VALUES (?1, ?2)", 
        [entity_id.to_string().as_str(), name])?;
    let rowid = db_get_last_insert_rowid(&tx)?;
    tx.commit()?;
    Ok(rowid)
}

fn db_submit_new_transaction(name: &str, description: &str, dbconn: State<DbConnection>) -> Result<u64, Box<dyn std::error::Error>>{
    let mut lock = dbconn.conn.lock().unwrap();
    let tx = lock.transaction()?;
    tx.execute(
        "INSERT INTO transactions (name, description) VALUES (?1, ?2)", 
        [name, description])?;
    let rowid = db_get_last_insert_rowid(&tx)?;
    tx.commit()?;
    Ok(rowid)
}

fn db_update_transaction_details(tx_id: u64, name: &str, description: &str, closed: bool, dbconn: State<DbConnection>) -> Result<bool, Box<dyn std::error::Error>>{
    let mut lock = dbconn.conn.lock().unwrap();
    let tx = lock.transaction()?;
    let affected = tx.execute(
        "UPDATE transactions SET name = ?1, description = ?2, closed = ?3 WHERE id = ?4", 
        [name, description, (closed as u64).to_string().as_str(), tx_id.to_string().as_str()])?;
    if affected != 1 {
        return Err(format!("Unexpected number of rows affected ({}).", affected).into());
    }
    tx.commit()?;
    Ok(true)
}

fn db_submit_new_item(name: &str, description: &str, dbconn: State<DbConnection>) -> Result<u64, Box<dyn std::error::Error>>{
    let mut lock = dbconn.conn.lock().unwrap();
    let tx = lock.transaction()?;
    tx.execute(
        "INSERT INTO items (name, description) VALUES (?1, ?2)", 
        [name, description])?;
    let rowid = db_get_last_insert_rowid(&tx)?;
    tx.commit()?;
    Ok(rowid)
}

fn db_submit_new_item_packaging(item_id: u64, qty: u64, unit: &str, units_per_qty: f64, dbconn: State<DbConnection>) -> Result<u64, Box<dyn std::error::Error>>{
    let mut lock = dbconn.conn.lock().unwrap();
    let tx = lock.transaction()?;
    tx.execute(
        "INSERT INTO packaged_item (item_id, qty, unit, units_per_qty) VALUES (?1, ?2, ?3, ?4)", 
        (item_id, qty, unit, units_per_qty))?;
    let rowid = db_get_last_insert_rowid(&tx)?;
    tx.commit()?;
    Ok(rowid)
}

#[tauri::command]
pub fn submit_new_entity(name: &str, description: &str, dbconn: State<DbConnection> ) -> Result<u64, String> {
    println!("Submit: new_entity name={}, description={}", name, description);
    db_submit_new_entity(&name, &description, dbconn)
        .map_err(|err| {
            err.to_string()
        })
}

#[tauri::command]
pub fn submit_new_account(name: &str, entity_id: u64, dbconn: State<DbConnection> ) -> Result<u64, String> {
    println!("Submit: new_account name={}, entity_id={}", name, entity_id);
    db_submit_new_account(&name, entity_id, dbconn)
        .map_err(|err| {
            err.to_string()
        })
}

#[tauri::command]
pub fn submit_new_transaction(name: &str, description: &str, dbconn: State<DbConnection> ) -> Result<u64, String> {
    println!("Submit: new_transaction name={}, description={}", name, description);
    let new_tx_id = db_submit_new_transaction(name, description, dbconn).map_err(|err| {
            err.to_string()
        });
    println!("new_tx with id={}", new_tx_id.clone()?);
    new_tx_id
}

#[tauri::command]
pub fn update_transaction_details(tx_id: u64, name: &str, description: &str, closed: bool, dbconn: State<DbConnection> ) -> Result<bool, String> {
    println!("Submit: update_transaction_details tx_id={}, name={}, description={}, closed={}", tx_id, name, description, closed);
    let res = db_update_transaction_details(tx_id, name, description, closed, dbconn).map_err(|err| {
        err.to_string()
    });
    println!("updated tx with id={}", tx_id);
    res
}

#[tauri::command]
pub fn submit_delete_account(id: u64, dbconn: State<DbConnection>) -> Result<u64, String> {
    println!("Submit: delete_account id={}", id);
    dbconn.conn.lock().unwrap().execute(
        "DELETE FROM entity_accounts WHERE id = ?1",
        [id])
        .map_err(|err| {
            err.to_string()
        })
        .map(|_| id)
}

#[tauri::command]
pub fn submit_delete_entity(id: u64, dbconn: State<DbConnection>) -> Result<u64, String> {
    println!("Submit: delete_entity id={}", id);
    dbconn.conn.lock().unwrap().execute(
        "DELETE FROM entities WHERE id = ?1",
        [id])
        .map_err(|err| {
            err.to_string()
        })
        .map(|_| id)
}

#[tauri::command]
pub fn submit_new_item(name: &str, description: &str, dbconn: State<DbConnection> ) -> Result<u64, String> {
    println!("Submit: new_item name={}, description={}", name, description);
    db_submit_new_item(&name, &description, dbconn)
        .map_err(|err| {
            err.to_string()
        })
}

#[tauri::command]
pub fn submit_new_item_packaging(item_id: u64, qty: u64, unit: &str, units_per_qty: f64, dbconn: State<DbConnection> ) -> Result<u64, String> {
    println!("Submit: new_item_packaging item={}", item_id);
    db_submit_new_item_packaging(item_id, qty, &unit, units_per_qty, dbconn)
        .map_err(|err| {
            err.to_string()
        })
}

#[inline]
fn db_table_contains_id(table: &str, id_name: &str, id_value: u64, dbconn_lock: &MutexGuard<'_, Connection>) -> Result<bool, Box<dyn std::error::Error>> {
    let id: u64 = dbconn_lock.query_row(
        format!("SELECT {} FROM {} WHERE {} = ?1", id_name, table, id_name).as_str(), 
        (id_value,), |row| row.get(0))?;
    Ok(id == id_value)
}

fn db_submit_new_currency_transfer(amount: f32, to_account_id: u64, from_account_id: u64, time: u64, transaction_id: u64, dbconn: State<DbConnection>) 
    -> Result<u64, Box<dyn std::error::Error>> {
    if to_account_id == from_account_id {
        return Err("To and from account must differ".into()); 
    }
    if amount == 0.0 {
        return Err("Amount must be non-zero".into())
    }
    let mut lock = dbconn.conn.lock().unwrap();

    if  !(db_table_contains_id("entity_accounts", "id", to_account_id, &lock)?) {
        return Err("Could not find to account in TABLE entity_accounts".into());
    }
        
    if  !(db_table_contains_id("entity_accounts", "id", from_account_id, &lock)?) {
        return Err("Could not find from account in TABLE entity_accounts".into());
    }

    let tx = lock.transaction()?;
    let rows_affected = tx.execute(
        "INSERT INTO currency_transfers (amount, to_account, from_account, time) VALUES (ROUND(?1, 2), ?2, ?3, ?4)",
        (amount, to_account_id, from_account_id, time)
    )?;
    if rows_affected != 1 {
        return Err("Failed to INSERT INTO currency_transfers".into())
    }
    let transfer_id = db_get_last_insert_rowid(&tx)?;
    let rows_affected = tx.execute(
        "INSERT INTO currency_transfer_transaction_link (transfer_id, transaction_id) VALUES (?1, ?2)",
        [transfer_id, transaction_id]
    )?;
    if rows_affected != 1 {
        return Err("Failed to INSERT INTO currency_transfer_transaction_link".into())
    }
    tx.commit()?;
    Ok(transfer_id)
}

#[tauri::command]
pub fn submit_new_currency_transfer(amount: f32, to_account_id: u64, from_account_id: u64, time: u64, transaction_id: u64, dbconn: State<DbConnection> ) -> Result<u64, String> {
    println!("Submit: new_currency_transfer amount={}, to_account={}, from_account={}, time={}, transaction={}", amount, to_account_id, from_account_id, time, transaction_id);
    let new_tx_id = db_submit_new_currency_transfer(amount, to_account_id, from_account_id, time, transaction_id, dbconn).map_err(|err| {
            err.to_string()
        });
    println!("created currency_transfer with id={}", new_tx_id.clone()?);
    new_tx_id
}

#[tauri::command]
pub fn submit_new_item_transfer(qty: f32, per_qty_constituent_cost: f32, packaging_id: u64, to_entity_id: u64, from_entity_id: u64, time: u64, transaction_id: u64, dbconn: State<DbConnection> ) -> Result<u64, String> {
    println!("Submit: new_item_transfer amount={}, per_qty_constituent_cost={}, packaging_id={}, to_account={}, from_account={}, time={}, transaction={}", qty, per_qty_constituent_cost, packaging_id, to_entity_id, from_entity_id, time, transaction_id);
    let new_tx_id = db_submit_new_item_transfer(qty, per_qty_constituent_cost, packaging_id, to_entity_id, from_entity_id, time, transaction_id, dbconn).map_err(|err| {
            err.to_string()
        });
    println!("created item_transfer with id={}", new_tx_id.clone()?);
    new_tx_id
}

fn db_submit_new_item_transfer(qty: f32, per_qty_constituent_cost: f32, packaging_id: u64, to_entity_id: u64, from_entity_id: u64, time: u64, transaction_id: u64, dbconn: State<DbConnection>) 
    -> Result<u64, Box<dyn std::error::Error>> {
    if to_entity_id == from_entity_id {
        return Err("To and from entities must differ".into()); 
    }
    if qty == 0.0 {
        return Err("Amount must be non-zero".into());
    }
    if per_qty_constituent_cost < 0.0 {
        return Err("Per quanitity constituent cost must be >= 0".into());
    }
    let mut lock = dbconn.conn.lock().unwrap();

    if  !(db_table_contains_id("entities", "id", to_entity_id, &lock)?) {
        return Err("Could not find to account in TABLE entities".into());
    }
        
    if  !(db_table_contains_id("entities", "id", from_entity_id, &lock)?) {
        return Err("Could not find from account in TABLE entities".into());
    }

    let tx = lock.transaction()?;
    let rows_affected = tx.execute(
        "INSERT INTO item_transfers (item_id, qty, per_qty_constituent_cost, to_entity_id, from_entity_id, time) VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
        (packaging_id, qty, per_qty_constituent_cost, to_entity_id, from_entity_id, time)
    )?;
    if rows_affected != 1 {
        return Err("Failed to INSERT INTO item_transfers".into())
    }
    let transfer_id = db_get_last_insert_rowid(&tx)?;
    let rows_affected = tx.execute(
        "INSERT INTO item_transfer_transaction_link (transfer_id, transaction_id) VALUES (?1, ?2)",
        [transfer_id, transaction_id]
    )?;
    if rows_affected != 1 {
        return Err("Failed to INSERT INTO item_transfer_transaction_link".into())
    }
    tx.commit()?;
    Ok(transfer_id)
}