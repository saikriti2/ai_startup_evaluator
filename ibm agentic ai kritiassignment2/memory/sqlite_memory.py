from __future__ import annotations

import os
import sqlite3
from datetime import datetime
from typing import Any, Dict, List, Optional


DB_PATH = os.path.join(os.path.dirname(__file__), "memory.db")


def _connect(db_path: str = DB_PATH) -> sqlite3.Connection:
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    return conn


def init_db(db_path: str = DB_PATH) -> None:
    """Create the SQLite memory table and add newer columns if needed."""

    os.makedirs(os.path.dirname(db_path), exist_ok=True)
    with _connect(db_path) as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS conversations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                customer_name TEXT NOT NULL,
                query TEXT NOT NULL,
                intent TEXT NOT NULL DEFAULT 'Unknown',
                department TEXT NOT NULL DEFAULT '',
                response TEXT NOT NULL,
                timestamp TEXT NOT NULL
            )
            """
        )

        columns = {
            row["name"]
            for row in conn.execute("PRAGMA table_info(conversations)").fetchall()
        }
        if "intent" not in columns:
            conn.execute("ALTER TABLE conversations ADD COLUMN intent TEXT NOT NULL DEFAULT 'Unknown'")
        if "department" not in columns:
            conn.execute("ALTER TABLE conversations ADD COLUMN department TEXT NOT NULL DEFAULT ''")
        conn.commit()


def save_conversation(
    customer_name: str,
    query: str,
    response: str,
    intent: str = "Unknown",
    department: str = "",
    db_path: str = DB_PATH,
) -> None:
    """Persist one completed customer interaction."""

    init_db(db_path)
    with _connect(db_path) as conn:
        conn.execute(
            """
            INSERT INTO conversations
                (customer_name, query, intent, department, response, timestamp)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (
                customer_name,
                query,
                intent,
                department,
                response,
                datetime.utcnow().isoformat(timespec="seconds"),
            ),
        )
        conn.commit()


def get_last_issue(customer_name: str, db_path: str = DB_PATH) -> Optional[str]:
    """Return the latest non-memory query for this customer."""

    init_db(db_path)
    with _connect(db_path) as conn:
        row = conn.execute(
            """
            SELECT query
            FROM conversations
            WHERE customer_name = ?
              AND intent != 'Memory'
            ORDER BY id DESC
            LIMIT 1
            """,
            (customer_name,),
        ).fetchone()
    return row["query"] if row else None


def get_conversation_history(customer_name: str, db_path: str = DB_PATH) -> List[Dict[str, Any]]:
    """Return stored conversation history for a customer."""

    init_db(db_path)
    with _connect(db_path) as conn:
        rows = conn.execute(
            """
            SELECT query, intent, department, response, timestamp
            FROM conversations
            WHERE customer_name = ?
            ORDER BY id ASC
            """,
            (customer_name,),
        ).fetchall()

    return [dict(row) for row in rows]
