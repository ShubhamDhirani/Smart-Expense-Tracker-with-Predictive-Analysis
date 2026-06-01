from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app import models
from app.security import get_current_user

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
    day_index = results[-1].date.weekday()

    features = last_window + [avg, day_index]

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