from datetime import date

import numpy as np

from langchain_core.prompts import ChatPromptTemplate
from langchain_ollama import OllamaLLM

from app.services.analytics_service import (
    get_monthly_total,
    get_category_breakdown,
)

from app.services.prediction_service import (
    get_daily_totals,
    prepare_features,
    train_models,
    forecast_future_expenses,
)


llm = OllamaLLM(model="mistral")


def build_financial_context(db, user_id):

    today = date.today()

    # ---------- Current Month ----------

    current_month_total = get_monthly_total(
        db,
        user_id,
        year=today.year,
        month=today.month,
    )

    # ---------- Last Month ----------

    if today.month == 1:
        last_month = 12
        last_month_year = today.year - 1
    else:
        last_month = today.month - 1
        last_month_year = today.year

    last_month_total = get_monthly_total(
        db,
        user_id,
        year=last_month_year,
        month=last_month,
    )

    # ---------- Category Breakdown ----------

    categories = get_category_breakdown(
        db,
        user_id,
    )

    category_summary = ""

    if categories:

        sorted_categories = sorted(
            categories,
            key=lambda x: x["total"],
            reverse=True,
        )

        for category in sorted_categories:

            category_summary += (
                f"{category['category']}: "
                f"₹{round(category['total'])}\n"
            )
    # ---------- Prediction ----------

    results = get_daily_totals(
        db,
        user_id,
    )

    predicted_next_month = 0

    if len(results) >= 30:

        X, y, daily_totals = prepare_features(results)

        linear_model, rf_model = train_models(
            X,
            y,
        )

        predictions = forecast_future_expenses(
            linear_model,
            rf_model,
            daily_totals,
            days_to_predict=30,
        )

        predicted_next_month = round(
            float(sum(predictions)),
            2,
        )

    context = f"""
Financial Summary

Current Month Spending:
₹{round(current_month_total)}

Last Month Spending:
₹{round(last_month_total)}

Category Breakdown:
{category_summary}

Predicted Next Month Spending:
₹{predicted_next_month}
"""

    return context


def ask_financial_assistant(
    db,
    user_id,
    question,
):

    context = build_financial_context(
        db,
        user_id,
    )

    prompt = ChatPromptTemplate.from_template(
        """
You are a personal finance assistant.

Use ONLY the financial information below.

{context}

User Question:
{question}

Instructions:
Instructions:
- Use ONLY the provided financial data.
- Never invent numbers or percentages.
- Never perform trend analysis unless the trend is explicitly present.
- Give concise answers.
- Be practical and helpful.
- If information is unavailable, say so clearly.
"""
    )

    chain = prompt | llm

    response = chain.invoke(
        {
            "context": context,
            "question": question,
        }
    )

    return response