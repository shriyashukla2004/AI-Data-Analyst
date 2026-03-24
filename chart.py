def format_chart(result):
    try:
        if result["status"] != "success":
            return {}

        data = result["data"]

        if not data or len(data[0].keys()) < 2:
            return {}

        keys = list(data[0].keys())
        x_key, y_key = keys[0], keys[1]

        labels = [str(row[x_key]) for row in data]
        # FIX: renamed "values" → "data" to match ChartRenderer.jsx which reads chart.data
        values = [row[y_key] for row in data]

        # Auto-detect chart type
        if "date" in x_key.lower():
            chart_type = "line"
        elif len(labels) <= 5:
            chart_type = "pie"
        else:
            chart_type = "bar"

        return {
            "type": chart_type,
            "labels": labels,
            "data": values,       # FIX: was "values", now "data"
            "x_key": x_key,
            "y_key": y_key
        }

    except Exception as e:
        print("Chart error:", e)
        return {}