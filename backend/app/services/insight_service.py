from langchain_ollama import OllamaLLM as Ollama

llm = Ollama(model="mistral")

def generate_ai_insights(
    current_month,
    predicted_month,
    highest_category,
    pace_change,
):
    prompt = f"""
    You are a personal finance analyst.

    Financial Facts:

    - Current month spending: ₹{current_month}
    - Predicted next month spending: ₹{predicted_month}
    - Highest spending category: {highest_category}
    - Spending pace change: {pace_change}%

    Generate exactly 3 useful insights.

    Requirements:

    1. Mention the highest spending category if relevant.
    2. Mention spending trend if relevant.
    3. Give one practical recommendation.
    4. Avoid generic advice.
    5. Maximum 15 words per insight.

    Return only the 3 bullet points.
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