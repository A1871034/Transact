#[derive(serde::Serialize)]
struct NewEntitySubmission {
    name: String,
    description: String,
}
#[tauri::command]
pub fn submit_new_entity(name: &str, description: &str) -> bool {
    println!("Received New Entity: {}, {}", name, description);
    return true;
}