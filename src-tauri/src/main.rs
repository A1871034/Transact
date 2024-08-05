// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

mod fe_gets;
use fe_gets::*;

mod fe_submits;
use fe_submits::*;

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            greet,
            get_transactions,
            get_ideas,
            get_entities,
            submit_new_entity,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
