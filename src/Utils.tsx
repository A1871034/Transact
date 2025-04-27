
function database_time_to_string(db_time: number | null ): string {
    if (db_time === null)
        return "Never";
    
    return new Date(db_time * 1000).toLocaleString("sv-SE");
}

function date_to_db_time(date_in: Date): number {
    return Math.floor(date_in.getTime()/1000);
}

function get_time_as_if_database(): number {
    return Math.floor(Date.now()/1000);
}

export { database_time_to_string, date_to_db_time, get_time_as_if_database };