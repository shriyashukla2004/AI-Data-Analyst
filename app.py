import os
import re
from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
from sqlalchemy import text

# Internal module imports
from db import (
    load_file_to_db, get_dataset_meta, engine, 
    DB_PATH, DATASET_META_FILE
)
from query_pipeline import handle_query
from insight import generate_insight, explain_chart
from chart import format_chart
from history import save_query, get_history, clear_history

app = Flask(__name__)
CORS(app)

# Configuration
UPLOAD_FOLDER = "uploads"
ALLOWED_EXTENSIONS = {"csv", "xlsx", "xls"}
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def allowed_file(filename):
    """Check if file extension is supported."""
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

def format_display_name(filename):
    """Clean filename for UI display: 'walmart_sales.csv' → 'Walmart Sales'."""
    name = re.sub(r'\.(csv|xlsx|xls)$', '', filename, flags=re.IGNORECASE)
    name = re.sub(r'[_-]+', ' ', name)
    return re.sub(r'([a-z])([A-Z])', r'\1 \2', name).title()

@app.route("/")
def home():
    return jsonify({"status": "online", "message": "AI Data Analyst API Running"})

# ── DATASET MANAGEMENT ──────────────────────────────────────────

@app.route("/upload", methods=["POST"])
def upload():
    if "file" not in request.files:
        return jsonify({"error": "No file provided."}), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "No file selected."}), 400

    if not allowed_file(file.filename):
        return jsonify({"error": f"Supported formats: {', '.join(ALLOWED_EXTENSIONS)}"}), 400

    filename = secure_filename(file.filename)
    filepath = os.path.join(UPLOAD_FOLDER, filename)
    
    try:
        file.save(filepath)
        meta = load_file_to_db(filepath, filename)
        
        return jsonify({
            "message": f"Dataset '{filename}' loaded successfully.",
            "filename": format_display_name(filename),
            "raw_filename": filename,
            "table_name": meta["table_name"],
            "row_count": meta["row_count"],
            "columns": meta["columns"]
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/dataset", methods=["GET"])
def get_dataset():
    meta = get_dataset_meta()
    if not meta:
        return jsonify({"error": "No dataset uploaded yet."}), 404
    
    raw_name = meta.get("raw_filename", meta.get("filename", "Unknown"))
    return jsonify({
        "filename": format_display_name(raw_name),
        "raw_filename": raw_name,
        "table_name": meta["table_name"],
        "row_count": meta["row_count"],
        "columns": meta["columns"]
    })

@app.route("/dataset/stats", methods=["GET"])
def dataset_stats():
    meta = get_dataset_meta()
    if not meta:
        return jsonify({"error": "No active dataset"}), 404
    
    cols = meta.get("columns", [])
    return jsonify({
        "row_count": meta["row_count"],
        "col_count": len(cols),
        "numeric_cols": [c["name"] for c in cols if any(t in c["type"].lower() for t in ["int", "float"])],
        "text_cols": [c["name"] for c in cols if any(t in c["type"].lower() for t in ["str", "object"])]
    })

# ── TABLE & QUERY EXPLORATION ───────────────────────────────────

@app.route("/table/<table_name>", methods=["GET"])
def get_table_data(table_name):
    try:
        limit = request.args.get('limit', 100, type=int)
        meta = get_dataset_meta()
        
        if not meta or meta["table_name"] != table_name:
            return jsonify({"error": "Table not found or inactive"}), 404
        
        with engine.connect() as connection:
            stmt = text(f"SELECT * FROM {table_name} LIMIT :limit")
            result = connection.execute(stmt, {"limit": limit})
            rows = [dict(row._mapping) for row in result]
        
        return jsonify({
            "table_name": table_name,
            "rows": rows,
            "columns": meta["columns"],
            "total_rows": meta["row_count"]
        })
    except Exception as e:
        return jsonify({"error": f"Database error: {str(e)}"}), 500

@app.route("/query", methods=["POST"])
def run_ai_query():
    try:
        data = request.get_json()
        if not data or "query" not in data:
            return jsonify({"error": "Natural language query is required."}), 400

        meta = get_dataset_meta()
        if not meta:
            return jsonify({"error": "Please upload a dataset first."}), 400

        # Execute Query Pipeline
        response = handle_query(data["query"])
        result = response["result"]

        if result["status"] != "success":
            return jsonify({"error": result["message"]}), 400

        # Generate AI Enhancements
        insight = generate_insight(result)
        chart_data = format_chart(result)
        explanation = explain_chart(chart_data)

        save_query(
            query=data["query"],
            sql=response["sql"],
            insight=insight,
            row_count=result.get("row_count", 0)
        )

        return jsonify({
            "sql": response["sql"],
            "insight": insight,
            "chart": chart_data,
            "chart_explanation": explanation,
            "rows": result.get("rows", [])
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ── SYSTEM & HISTORY ───────────────────────────────────────────

@app.route("/dataset/reset", methods=["POST"])
def reset_system():
    """Clear database, metadata, and history for a fresh start."""
    try:
        errors = []
        for path in [DB_PATH, DATASET_META_FILE]:
            if os.path.exists(path):
                try:
                    os.remove(path)
                except Exception as e:
                    errors.append(str(e))
        
        clear_history()
        
        if errors:
            return jsonify({"message": "Partial reset", "errors": errors}), 207
        return jsonify({"message": "System reset successfully. Ready for new upload."})
    except Exception as e:
        return jsonify({"error": f"Reset failed: {str(e)}"}), 500

@app.route("/history", methods=["GET"])
def get_query_history():
    return jsonify(get_history())

@app.route("/history/clear", methods=["DELETE"])
def delete_history():
    clear_history()
    return jsonify({"message": "Query history cleared successfully."})

if __name__ == "__main__":
    app.run(debug=True, port=5000)