from llm import client


def generate_insight(result):
    for model in [
        "llama-3.3-70b-versatile",
        "llama-3.1-8b-instant",
        "mixtral-8x7b-32768"
    ]:
        try:
            response = client.chat.completions.create(
                model=model,
                messages=[{
                    "role": "user",
                    "content": f"""
You are a senior data analyst. Analyze the data below and return exactly 3-5 key business insights.

STRICT FORMAT RULES — follow exactly:
- Number each point: 1. 2. 3. etc.
- Start each point with a bold title: **Title**: then the explanation
- Keep each explanation to 1-2 sentences max
- No intro sentence, no conclusion, no extra commentary
- Do NOT write "Here are the insights" or any preamble

Example format:
1. **Seasonal Peaks**: Sales spike significantly in Q4, driven by holiday demand.
2. **Top Performer**: Store 3 consistently outperforms others by 21% on average.
3. **Growth Trend**: Revenue has grown 8% month-over-month for the past 6 months.

Data:
{result}
                    """
                }],
                temperature=0.3
            )
            return response.choices[0].message.content.strip()

        except Exception as e:
            print(f"Insight model failed: {model} → {e}")

    return "1. **No Insights**: Could not generate insights at this time."


def explain_chart(chart):
    for model in [
        "llama-3.1-8b-instant",
        "mixtral-8x7b-32768"
    ]:
        try:
            response = client.chat.completions.create(
                model=model,
                messages=[{
                    "role": "user",
                    "content": f"""
You are a data analyst. Explain this chart in one clear sentence suitable for a chat response.
Do NOT use markdown, bullet points, or bold text. Plain sentence only.

Chart data: {chart}
                    """
                }],
                temperature=0.3
            )
            return response.choices[0].message.content.strip()

        except Exception:
            continue

    return "Here are your query results."
