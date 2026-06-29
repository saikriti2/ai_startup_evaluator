CREATE TABLE IF NOT EXISTS conversations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_name TEXT NOT NULL,
    query TEXT NOT NULL,
    intent TEXT NOT NULL DEFAULT 'Unknown',
    department TEXT NOT NULL DEFAULT '',
    response TEXT NOT NULL,
    timestamp TEXT NOT NULL
);
