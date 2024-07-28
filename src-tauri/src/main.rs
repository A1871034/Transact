// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

// Transaction list endpoint
#[derive(serde::Serialize)]
struct TransactionFE {
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
fn get_transactions() -> Vec<TransactionFE> {
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

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![greet, get_transactions])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
