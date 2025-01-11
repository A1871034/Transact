CREATE TABLE IF NOT EXISTS entities (
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
    description TEXT NOT NULL,
    latest INTEGER NOT NULL DEFAULT (cast(strftime('%s', 'now') as int)),
    added INTEGER NOT NULL DEFAULT (cast(strftime('%s', 'now') as int)),
    PRIMARY KEY (id)
);
    
CREATE TABLE IF NOT EXISTS currency_transfer (
    id INTEGER NOT NULL,
    amount DECIMAL NOT NULL,
    from_account INTEGER NOT NULL,
    to_account INTEGER NOT NULL,
    time TIMESTAMP NOT NULL,
    added INTEGER NOT NULL DEFAULT (cast(strftime('%s', 'now') as int)),
    PRIMARY KEY (id),
    FOREIGN KEY (from_account) REFERENCES entity_accounts(id),
    FOREIGN KEY (to_account) REFERENCES entity_accounts(id)
);

CREATE TABLE IF NOT EXISTS currency_transfer_transaction_link (
    transfer_id INTEGER NOT NULL,
    transaction_id INTEGER NOT NULL,
    complex_id INTEGER NOT NULL,
    FOREIGN KEY (transfer_id) REFERENCES currency_transfer(id),
    FOREIGN KEY (transaction_id) REFERENCES transactions(id)
);

-- CREATE TABLE IF NOT EXISTS asset_transfer_transaction_link (
--     transfer_id INTEGER NOT NULL,
--     transaction_id INTEGER NOT NULL,
--     complex_id INTEGER NOT NULL,
--     consituent_value DECIMAL,
--     FOREIGN KEY (transfer_id) REFERENCES asset_transfer(id)
--     FOREIGN KEY (transaction_id) REFERENCES (id)
-- );