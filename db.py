import pandas as pd
from sqlalchemy import create_engine, text
import os
import json

# ── SQLite database (no PostgreSQL needed) ──────────────────────
DB_PATH = "uploaded_data.db"
engine = create_engine(f"sqlite:///{DB_PATH}")

# ── Dataset metadata file ───────────────────────────────────────
DATASET_META_FILE = "dataset_meta.json"


def save_dataset_meta(table_name, columns, row_count, filename):
    meta = {
        "table_name": table_name,
        "columns": columns,
        "row_count": row_count,
        "filename": filename
    }
    with open(DATASET_META_FILE, "w") as f:
        json.dump(meta, f, indent=2)


def get_dataset_meta():
    if not os.path.exists(DATASET_META_FILE):
        return None
    with open(DATASET_META_FILE, "r") as f:
        return json.load(f)


def load_file_to_db(filepath, filename):
    """
    Load a CSV or Excel file into SQLite.
    Returns metadata dict on success, raises on failure.
    """
    ext = filename.lower().split(".")[-1]

    if ext == "csv":
        df = pd.read_csv(filepath)
    elif ext in ["xlsx", "xls"]:
        df = pd.read_excel(filepath)
    else:
        raise ValueError(f"Unsupported file type: .{ext}. Upload a CSV or Excel file.")

    if df.empty:
        raise ValueError("The uploaded file is empty.")

    # Sanitise column names: lowercase, replace spaces/special chars with _
    df.columns = [
        c.strip().lower().replace(" ", "_").replace("-", "_").replace(".", "_")
        for c in df.columns
    ]

    # Use the filename (without extension) as the table name
    table_name = filename.rsplit(".", 1)[0].lower()
    table_name = "".join(c if c.isalnum() or c == "_" else "_" for c in table_name)
    table_name = table_name[:50]  # cap length

    # Write into SQLite (replace if exists)
    df.to_sql(table_name, engine, if_exists="replace", index=False)

    columns = []
    for col, dtype in zip(df.columns, df.dtypes):
        sample_vals = df[col].dropna().head(3).tolist()
        columns.append({
            "name": col,
            "type": str(dtype),
            "sample": [str(v) for v in sample_vals]
        })

    meta = {
        "table_name": table_name,
        "columns": columns,
        "row_count": len(df),
        "filename": filename
    }
    save_dataset_meta(table_name, columns, len(df), filename)
    return meta


def validate_sql(query):
    query_upper = query.upper()
    forbidden = ["INSERT", "UPDATE", "DELETE", "DROP", "ALTER"]
    if any(word in query_upper for word in forbidden):
        raise ValueError("Unsafe query detected!")
    if not query_upper.strip().startswith("SELECT"):
        raise ValueError("Only SELECT queries are allowed.")
    return True


def run_query(sql):
    try:
        validate_sql(sql)
        with engine.connect() as conn:
            result = conn.execute(text(sql))
            rows = [dict(row._mapping) for row in result]

        return {
            "status": "success",
            "rows": len(rows),
            "data": rows
        }

    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }
