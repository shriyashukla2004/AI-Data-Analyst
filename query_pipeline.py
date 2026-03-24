from llm import generate_sql
from db import run_query


def handle_query(user_query):
    sql = generate_sql(user_query)
    result = run_query(sql)

    return {
        "query": user_query,
        "sql": sql,
        "result": result
    }
