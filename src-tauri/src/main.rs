// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command

const DATABASE_PATH: &str = "../test.db"; 
const SQL_SETUP_PATH: &str = "./src/setup.sql";
use rusqlite::{Connection, Result, Error};
use std::{fs::read_to_string, panic, sync::Mutex};
struct DbConnection {
    conn: Mutex<rusqlite::Connection>
}

mod fe_gets;
use fe_gets::*;

mod fe_submits;
use fe_submits::*;

fn setup_sqlite() -> Result<rusqlite::Connection> {
    let conn = Connection::open(DATABASE_PATH)?;
    let sql_setup_string = read_to_string(SQL_SETUP_PATH).unwrap_or_else(|error| {
        let path = std::env::current_dir().expect("Failed to get current directory");
        println!("The current directory is {}", path.display());
        panic!("Failed to read SQL_SETUP_PATH=\"{SQL_SETUP_PATH}\": {error:?}");
    });
    let sql_setup_str = sql_setup_string.as_str();
    conn.execute_batch(sql_setup_str)?;
    Ok(conn)
}

fn main() {
    let conn = setup_sqlite().unwrap_or_else(|err: Error| {
        panic!("---- FATAL ----\nSQLITE Setup Error\n {}", err.to_string());
    });
    tauri::Builder::default()
        .manage(DbConnection { conn: Mutex::new(conn) })
        .invoke_handler(tauri::generate_handler![
            get_accounts,
            get_bare_accounts,
            get_transfers,
            get_transaction,
            get_transactions,
            get_entities,
            get_bare_entities,
            get_item,
            get_items,
            // get_bare_items,
            get_all_packaged_items,
            submit_new_entity,
            submit_new_account,
            submit_new_transaction,
            update_transaction_details,
            submit_new_currency_transfer,
            submit_new_item_transfer,
            submit_delete_account,
            submit_delete_entity,
            submit_new_item,
            submit_new_item_packaging,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
