import streamlit as st
import requests

st.title("AI Data Analyst Dashboard")

query = st.text_input("Ask your question")

if st.button("Run"):
    res = requests.post("http://127.0.0.1:5000/query", json={
        "query": query
    })

    data = res.json()

    if "error" in data:
        st.error(data["error"])
    else:
        st.subheader("🧾 SQL")
        st.code(data["sql"])

        st.subheader("💡 Insight")
        # FIX: was data["insights"] (wrong key), now data["insight"] to match app.py response
        st.write(data["insight"])

        chart = data.get("chart", {})

        if chart:
            st.subheader("📊 Chart")

            # FIX: was chart["values"] (wrong key), now chart["data"] to match chart.py output
            if chart.get("type") == "bar":
                st.bar_chart(chart["data"])

            elif chart.get("type") == "line":
                st.line_chart(chart["data"])

            elif chart.get("type") == "pie":
                st.write(dict(zip(chart["labels"], chart["data"])))

        st.subheader("🧠 Chart Explanation")
        st.write(data.get("chart_explanation", "No explanation available."))