use crate::DbConnection;
use rusqlite::Transaction;
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

#[tauri::command]
pub fn submit_new_entity(name: &str, description: &str, dbconn: State<DbConnection> ) -> Result<u64, String> {
    println!("Submit: new_entity name={}, description={}", name, description);
    db_submit_new_entity(&name, &description, dbconn)
        .map_err(|err| {
            err.to_string()
        })
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
pub fn submit_new_account(name: &str, entity_id: u64, dbconn: State<DbConnection> ) -> Result<u64, String> {
    println!("Submit: new_account name={}, entity_id={}", name, entity_id);
    db_submit_new_account(&name, entity_id, dbconn)
        .map_err(|err| {
            err.to_string()
        })
}