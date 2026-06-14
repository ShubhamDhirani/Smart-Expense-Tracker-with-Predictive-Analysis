from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
import numpy as np

from app.database import get_db
from app import models
from app.security import get_current_user
from app.services.insight_service import generate_ai_insights
from app.services.analytics_service import (
    get_category_breakdown,
)

from app.services.prediction_service import (
    get_daily_totals,
    prepare_features,
    train_models,
    WINDOW_SIZE,
    forecast_future_expenses,
    evaluate_models,
)

router = APIRouter(prefix="/predict", tags=["Prediction"])

@router.get("/next-day")
def predict_next_day(
    db: Session = Depends(get_db),
    user_email: str = Depends(get_current_user),
):
    user = db.query(models.User).filter(models.User.email == user_email).first()

    results = get_daily_totals(db,user.id)

    if len(results) < 5:
        raise HTTPException(
            status_code=400,
            detail="Not enough data to predict (need at least 5 days)",
        )

    
    X, y, daily_totals = prepare_features(results)

    linear_model, rf_model = train_models(X, y)

    # Step 5: Predict next day
    last_window = daily_totals[-WINDOW_SIZE:]

    avg = sum(last_window) / WINDOW_SIZE

    trend = last_window[-1] - last_window[0]

    std = np.std(last_window)

    weekly_window = daily_totals[-7:]
    weekly_avg = np.mean(weekly_window)

    day_index = results[-1].date.weekday()

    day_of_month = results[-1].date.day

    month = results[-1].date.month

    features = last_window + [
        avg,
        trend,
        std,
        weekly_avg,
        day_index,
        day_of_month,
        month,
    ]

    linear_prediction = linear_model.predict([features])[0]
    rf_prediction = rf_model.predict([features])[0]

    linear_prediction = max(linear_prediction, 0)
    rf_prediction = max(rf_prediction, 0)

    return {
        "days_used": len(daily_totals),

        "linear_regression_prediction":
            round(float(linear_prediction), 2),

        "random_forest_prediction":
            round(float(rf_prediction), 2),    
    }

@router.get("/next-week")
def predict_next_week(
    db: Session = Depends(get_db),
    user_email: str = Depends(get_current_user),
):
    user = db.query(models.User).filter(models.User.email == user_email).first()

    # Step 1: Get daily totals
    results = get_daily_totals(db, user.id)

    if len(results) < 7:
        raise HTTPException(
            status_code=400,
            detail="Not enough data to predict (need at least 7 days)",
        )

    X, y, daily_totals = prepare_features(results)

    linear_model, rf_model = train_models(X, y)

    predictions = forecast_future_expenses(
        linear_model,
        rf_model,
        daily_totals,
        days_to_predict=7,
    )

    total_prediction = sum(predictions)

    return {
        "days_used": len(daily_totals),
        "predicted_next_week_expense": round(float(total_prediction), 2),
        "daily_predictions": [round(float(p), 2) for p in predictions],
    }

@router.get("/next-month")
def predict_next_month(
    db: Session = Depends(get_db),
    user_email: str = Depends(get_current_user),
):
    user = db.query(models.User).filter(models.User.email == user_email).first()

    results = get_daily_totals(db, user.id)

    if len(results) < 30:
        raise HTTPException(
            status_code=400,
            detail="Not enough data to predict (need at least 30 days)",
        )

    X, y, daily_totals = prepare_features(results)

    linear_model, rf_model = train_models(X, y)

    predictions = forecast_future_expenses(
        linear_model,
        rf_model,
        daily_totals,
        days_to_predict=30,
    )

    total_prediction = sum(predictions)

    return {
        "days_used": len(daily_totals),

        "predicted_next_month_expense":
            round(float(total_prediction), 2),

        "daily_predictions":
            [round(float(p), 2) for p in predictions],
    }

@router.get("/metrics")
def get_model_metrics(
    db: Session = Depends(get_db),
    user_email: str = Depends(get_current_user),
):
    user = db.query(models.User).filter(models.User.email == user_email).first()

    results = get_daily_totals(db, user.id)

    if len(results) < 10:
        raise HTTPException(
            status_code=400,
            detail="Not enough data to evaluate models",
        )

    X, y, daily_totals = prepare_features(results)

    metrics = evaluate_models(X, y)

    return metrics

@router.get("/insights")
def get_ai_insights(
    db: Session = Depends(get_db),
    user_email: str = Depends(get_current_user),
):
    user = (
        db.query(models.User)
        .filter(models.User.email == user_email)
        .first()
    )

    results = get_daily_totals(db, user.id)

    if len(results) < 30:
        raise HTTPException(
            status_code=400,
            detail="Not enough data for AI insights",
        )

    # ---------- Monthly comparison ----------

    daily_totals = [r.total for r in results]

    current_daily_avg = np.mean(daily_totals[-7:])

    previous_daily_avg = np.mean(
        daily_totals[-14:-7]
    )

    pace_change = (
        ((current_daily_avg - previous_daily_avg)
         / previous_daily_avg)
        * 100
    )

    # ---------- Forecast ----------

    X, y, _ = prepare_features(results)

    metrics = evaluate_models(X, y)

    rf_r2 = metrics["random_forest"]["r2_score"]

    linear_model, rf_model = train_models(X, y)

    predictions = forecast_future_expenses(
        linear_model,
        rf_model,
        daily_totals,
        days_to_predict=30,
    )

    predicted_month = sum(predictions)

    recent_month = sum(daily_totals[-30:])

    categories = get_category_breakdown(
    db,
    user.id,
    )

    highest_category = "Unknown"

    if categories:
        highest_category = max(
            categories,
            key=lambda x: x["total"]
        )["category"]

    forecast_change = (
        ((predicted_month - recent_month)
         / recent_month)
        * 100
    )

    insights = generate_ai_insights(
    current_month=round(recent_month),
    predicted_month=round(predicted_month),
    highest_category=highest_category,
    pace_change=round(pace_change, 1),
)

    return {
        "insights": insights
    }