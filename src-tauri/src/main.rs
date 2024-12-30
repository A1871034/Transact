// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command

const DATABASE_PATH: &str = "../test.db"; 
use rusqlite::{Connection, Result}; // Transaction
use std::sync::Mutex;
struct DbConnection {
    conn: Mutex<rusqlite::Connection>
}

mod fe_gets;
use fe_gets::*;

mod fe_submits;
use fe_submits::*;


fn setup_sqlite() -> Result<rusqlite::Connection> {
    let conn = Connection::open(DATABASE_PATH)?;
    conn.execute_batch(
    "CREATE TABLE IF NOT EXISTS entities (
            id INTEGER NOT NULL,
            name TEXT NOT NULL,
            description TEXT,
            added INTEGER NOT NULL DEFAULT (cast(strftime('%s', 'now') as int)),
            PRIMARY KEY (id)
        );
        
        CREATE TABLE IF NOT EXISTS entity_accounts (
            id INTEGER NOT NULL,
            entity_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            added INTEGER NOT NULL DEFAULT (cast(strftime('%s', 'now') as int)),
            PRIMARY KEY (id),
            FOREIGN KEY (entity_id) REFERENCES entities(id)
        );
        
        CREATE TABLE IF NOT EXISTS transactions (
            id INTEGER NOT NULL,
            name TEXT NOT NULL,
            description TEXT,
            time TIMESTAMP NOT NULL,
            added INTEGER NOT NULL DEFAULT (cast(strftime('%s', 'now') as int)),
            PRIMARY KEY (id)
        );
        
        CREATE TABLE IF NOT EXISTS ideas (
            id INTEGER NOT NULL,
            name TEXT NOT NULL,
            description TEXT NOT NULL,
            added INTEGER NOT NULL DEFAULT (cast(strftime('%s', 'now') as int)),
            PRIMARY KEY (id)
        );
        
        CREATE TABLE IF NOT EXISTS transaction_idea_link (
            transaction_id INTEGER NOT NULL,
            complex_id INTEGER NOT NULL,
            FOREIGN KEY (transaction_id) REFERENCES transactions(id)
            FOREIGN KEY (complex_id) REFERENCES complex_transactions(id)
        );
        
        CREATE TABLE IF NOT EXISTS currency_transfer (
            id INTEGER NOT NULL,
            currency TEXT NOT NULL,
            amount INTEGER NOT NULL,
            from_account INTEGER NOT NULL,
            to_account INTEGER NOT NULL,
            PRIMARY KEY (id),
            FOREIGN KEY (from_account) REFERENCES entity_accounts(id),
            FOREIGN KEY (to_account) REFERENCES entity_accounts(id)
        );")?;
    Ok(conn)
}

fn main() {
    let conn = setup_sqlite().unwrap();
    tauri::Builder::default()
        .manage(DbConnection { conn: Mutex::new(conn) })
        .invoke_handler(tauri::generate_handler![
            get_accounts,
            get_transactions,
            get_ideas,
            get_entities,
            get_bare_entities,
            submit_new_entity,
            submit_new_account,
            submit_delete_account,
            submit_delete_entity,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
