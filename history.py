import json
import os
from datetime import datetime

HISTORY_FILE = "history.json"


def save_query(query, sql, insight="", row_count=0):
    history = []

    if os.path.exists(HISTORY_FILE):
        with open(HISTORY_FILE, "r") as f:
            try:
                history = json.load(f)
            except Exception:
                history = []

    history.append({
        "id": len(history) + 1,
        "query": query,
        "sql": sql,
        "insight": insight,
        "row_count": row_count,
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    })

    # Keep last 50
    history = history[-50:]

    with open(HISTORY_FILE, "w") as f:
        json.dump(history, f, indent=2)


def get_history():
    if not os.path.exists(HISTORY_FILE):
        return []
    with open(HISTORY_FILE, "r") as f:
        try:
            history = json.load(f)
            return list(reversed(history))  # newest first
        except Exception:
            return []


def clear_history():
    if os.path.exists(HISTORY_FILE):
        os.remove(HISTORY_FILE)
