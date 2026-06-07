from langchain_ollama import OllamaLLM as Ollama

llm = Ollama(model="mistral")

def generate_ai_insights(
    pace_change,
    forecast_change,
    rf_r2,
):
    prompt = f"""
You are a personal finance analyst.

Financial Facts:

- Spending pace changed by {pace_change}% compared to the previous period.
- Next month's spending is projected to change by {forecast_change}%.
- Forecast reliability score is {rf_r2}.

Generate exactly 3 bullet-point insights.

Requirements:

1. First bullet:
   Explain the user's current spending behaviour.

2. Second bullet:
   Explain what the forecast means for next month.

3. Third bullet:
   Give a practical recommendation.

4. Do NOT repeat the same information.

5. Do NOT explain calculations.

6. Do NOT mention machine learning, AI, models, or reliability scores.

7. Keep each bullet under 15 words.

Return ONLY the 3 bullet points.
"""

    response = llm.invoke(prompt)

    lines = [
        line.strip()
        for line in response.split("\n")
        if line.strip()
    ]

    cleaned = []

    for line in lines:
        line = line.lstrip("1234567890.- ")
        cleaned.append(line)

    return cleaned