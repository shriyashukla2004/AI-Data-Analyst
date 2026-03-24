import os
import re
from groq import Groq
from dotenv import load_dotenv
from db import get_dataset_meta

MODEL_CANDIDATES = [
    "llama-3.3-70b-versatile",
    "llama-3.1-8b-instant",
    "mixtral-8x7b-32768"
]

load_dotenv()
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def build_system_prompt(meta):
    """
    Dynamically build a high-context SQL generation prompt with few-shot examples.
    """
    table_name = meta["table_name"]
    columns = meta["columns"]

    # Create a detailed string of column metadata
    col_descriptions = "\n".join(
        f"  - {c['name']} ({c['type']}) — samples: {', '.join(c.get('sample', []))}"
        for c in columns
    )

    return f"""
You are a Senior Data Analyst and SQLite Expert. 
Your job is to translate natural language questions into valid SQLite SQL.

### DATABASE SCHEMA
Table Name: {table_name}
Total Rows: {meta['row_count']}
Columns:
{col_descriptions}

### EXECUTION RULES
1. ONLY output the raw SQL query. No prose, no markdown blocks, no explanations.
2. ALWAYS include 'LIMIT 100' unless the user asks for a specific count.
3. Use EXACT column names as defined in the schema above.
4. For temporal analysis (Year/Month), use SQLite's strftime() function.
5. Use clear aliases for aggregates (e.g., SUM(col) AS total_value).
6. Only perform SELECT operations. Forbidden: INSERT, UPDATE, DELETE, DROP.

### FEW-SHOT EXAMPLES (Follow this logic)

User: What is the average of {columns[0]['name']} grouped by {columns[1]['name'] if len(columns)>1 else 'category'}?
SQL: SELECT {columns[1]['name'] if len(columns)>1 else 'category'}, AVG({columns[0]['name']}) AS average_val FROM {table_name} GROUP BY 1 ORDER BY average_val DESC LIMIT 100;

User: show me the sum, min, and max of {columns[0]['name']}
SQL: SELECT SUM({columns[0]['name']}) AS sum, MIN({columns[0]['name']}) AS min, MAX({columns[0]['name']}) AS max FROM {table_name} LIMIT 1;

User: trend of sales over time
SQL: SELECT strftime('%Y-%m', date) AS month, SUM(weekly_sales) AS total_sales FROM {table_name} GROUP BY month ORDER BY month ASC LIMIT 100;

User: top 5 rows where {columns[0]['name']} is greater than 100
SQL: SELECT * FROM {table_name} WHERE {columns[0]['name']} > 100 ORDER BY {columns[0]['name']} DESC LIMIT 5;

STRICT RULES:
- Only generate SELECT queries.
- NEVER use INSERT, UPDATE, DELETE, DROP, ALTER.
- Always use EXACT column names.
- Always include LIMIT 100.
- Use aggregation functions properly: SUM, AVG, COUNT, MIN, MAX.
- Use aliases (AS) for readability (e.g., SUM(col) AS sum).
- Use SQLite syntax only.
- Output ONLY the SQL query. No explanation.

Example Aggregation:
User: show sum, average, min, and max of {columns[0]['name']}
SQL:
SELECT SUM({columns[0]['name']}) AS sum,
       AVG({columns[0]['name']}) AS avg,
       MIN({columns[0]['name']}) AS min,
       MAX({columns[0]['name']}) AS max
FROM {table_name}
LIMIT 1;

Example:
User: total {columns[0]['name']} by {columns[1]['name'] if len(columns) > 1 else columns[0]['name']}
SQL:
SELECT {columns[1]['name'] if len(columns) > 1 else columns[0]['name']},
       SUM({columns[0]['name']}) AS total
FROM {table_name}
GROUP BY {columns[1]['name'] if len(columns) > 1 else columns[0]['name']}
ORDER BY total DESC
LIMIT 100;
"""




def clean_sql(sql):
    sql = re.sub(r"```sql|```", "", sql)
    return sql.strip()


def validate_sql(sql):
    sql_upper = sql.upper()
    forbidden = ["INSERT", "UPDATE", "DELETE", "DROP", "ALTER"]
    if any(word in sql_upper for word in forbidden):
        raise ValueError("Unsafe SQL detected!")
    if not sql_upper.startswith("SELECT"):
        raise ValueError("Only SELECT queries are allowed.")
    return True


def generate_sql(user_query):
    meta = get_dataset_meta()
    if not meta:
        raise Exception("No dataset uploaded yet. Please upload a CSV or Excel file first.")

    system_prompt = build_system_prompt(meta)
    last_error = None

    for model in MODEL_CANDIDATES:
        try:
            response = client.chat.completions.create(
                model=model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_query}
                ],
                temperature=0
            )

            raw_sql = response.choices[0].message.content
            sql = clean_sql(raw_sql)
            validate_sql(sql)

            print(f"Model: {model}")
            return sql

        except Exception as e:
            print(f"Model failed: {model} → {e}")
            last_error = e

    raise Exception(f"All models failed: {last_error}")
