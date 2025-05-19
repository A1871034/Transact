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
    currency TEXT NOT NULL DEFAULT 'AUD',
    added INTEGER NOT NULL DEFAULT (cast(strftime('%s', 'now') as int)),
    PRIMARY KEY (id),
    FOREIGN KEY (entity_id) REFERENCES entities(id)
);
    
CREATE TABLE IF NOT EXISTS currency_transfers (
    id INTEGER NOT NULL,
    amount DECIMAL NOT NULL,
    to_account INTEGER NOT NULL,
    from_account INTEGER NOT NULL,
    time INTEGER NOT NULL,
    added INTEGER NOT NULL DEFAULT (cast(strftime('%s', 'now') as int)),
    PRIMARY KEY (id),
    FOREIGN KEY (from_account) REFERENCES entity_accounts(id),
    FOREIGN KEY (to_account) REFERENCES entity_accounts(id)
);

CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    closed BOOLEAN NOT NULL DEFAULT 0 CHECK (closed = 0 OR closed = 1),
    added INTEGER NOT NULL DEFAULT (cast(strftime('%s', 'now') as int)),
    latest_currency_transfer_id INTEGER DEFAULT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (latest_currency_transfer_id) REFERENCES currency_transfers(id)
);
    -- latest_asset_transfer_id INTEGER DEFAULT,
    -- FOREIGN KEY (latest_asset_transfer_id) REFERENCES asset_transfer(id)

CREATE TABLE IF NOT EXISTS currency_transfer_transaction_link (
    transfer_id INTEGER NOT NULL,
    transaction_id INTEGER NOT NULL,
    FOREIGN KEY (transfer_id) REFERENCES currency_transfers(id),
    FOREIGN KEY (transaction_id) REFERENCES transactions(id)
);


CREATE TABLE IF NOT EXISTS items (
    id INTEGER NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    qty INTEGER,
    unit TEXT,
    per_qty_unit_value DECIMAL
);
    -- category_id INTEGER NOT NULL,

CREATE TABLE IF NOT EXISTS item_transfers (
    id INTEGER NOT NULL,
    item_id INTEGER NOT NULL,
    qty DECIMAL NOT NULL,
    per_qty_constituent_cost DECIMAL NOT NULL,
    to_entity_id INTEGER NOT NULL,
    from_entity_id INTEGER NOT NULL,
    time INTEGER NOT NULL,
    added INTEGER NOT NULL DEFAULT (cast(strftime('%s', 'now') as int)),
    PRIMARY KEY (id),
    FOREIGN KEY (item_id) REFERENCES items(id),
    FOREIGN KEY (to_entity_id) REFERENCES entities(id),
    FOREIGN KEY (from_entity_id) REFERENCES entities(id)
);
    -- deductibe_id INTEGER NOT NULL,
    -- transfer_necescity_id INTEGER NOT NULL,

CREATE TABLE IF NOT EXISTS item_transfer_transaction_link (
    transfer_id INTEGER NOT NULL,
    transaction_id INTEGER NOT NULL,
    FOREIGN KEY (transfer_id) REFERENCES item_transfers(id),
    FOREIGN KEY (transaction_id) REFERENCES transactions(id)
);