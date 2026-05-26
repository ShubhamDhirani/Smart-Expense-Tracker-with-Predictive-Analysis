from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor

from app.database import get_db
from app import models
from app.security import get_current_user

router = APIRouter(prefix="/predict", tags=["Prediction"])

@router.get("/next-day")
def predict_next_day(
    db: Session = Depends(get_db),
    user_email: str = Depends(get_current_user),
):
    user = db.query(models.User).filter(models.User.email == user_email).first()

    # Step 1: Get daily totals
    results = (
        db.query(
            models.Expense.date,
            func.sum(models.Expense.amount).label("total"),
        )
        .filter(models.Expense.user_id == user.id)
        .group_by(models.Expense.date)
        .order_by(models.Expense.date)
        .all()
    )

    if len(results) < 5:
        raise HTTPException(
            status_code=400,
            detail="Not enough data to predict (need at least 5 days)",
        )

    
    daily_totals = [r.total for r in results]

    
    WINDOW_SIZE = 3
    X = []
    y = []

    for i in range(len(daily_totals) - WINDOW_SIZE):
        for i in range(len(daily_totals) - WINDOW_SIZE):
            window = daily_totals[i:i + WINDOW_SIZE]
    
            # Rolling average
            avg = sum(window) / WINDOW_SIZE
    
            # Day of week (0=Monday)
            day_index = (results[i + WINDOW_SIZE].date.weekday())
    
            # Final feature vector
            features = window + [avg, day_index]
    
            X.append(features)
            y.append(daily_totals[i + WINDOW_SIZE])

    X = np.array(X)
    y = np.array(y)

    # Step 4: Train model
    linear_model = LinearRegression()
    linear_model.fit(X, y)

    rf_model = RandomForestRegressor(
        n_estimators = 100,
        random_state=42
    )
    rf_model.fit(X,y)

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
    results = (
        db.query(
            models.Expense.date,
            func.sum(models.Expense.amount).label("total"),
        )
        .filter(models.Expense.user_id == user.id)
        .group_by(models.Expense.date)
        .order_by(models.Expense.date)
        .all()
    )

    if len(results) < 7:
        raise HTTPException(
            status_code=400,
            detail="Not enough data to predict (need at least 7 days)",
        )

    # Step 2: Extract totals
    daily_totals = [r.total for r in results]

    # Step 3: Sliding window training
    WINDOW_SIZE = 3
    X = []
    y = []

    for i in range(len(daily_totals) - WINDOW_SIZE):
        X.append(daily_totals[i:i + WINDOW_SIZE])
        y.append(daily_totals[i + WINDOW_SIZE])

    X = np.array(X)
    y = np.array(y)

    # Step 4: Train model
    model = LinearRegression()
    model.fit(X, y)

    # Step 5: Predict next 7 days iteratively
    predictions = []
    current_window = daily_totals[-WINDOW_SIZE:].copy()

    for _ in range(7):
        next_pred = model.predict([current_window])[0]
        next_pred = max(next_pred, 0)

        predictions.append(next_pred)

        # shift window
        current_window.pop(0)
        current_window.append(next_pred)

    total_prediction = sum(predictions)

    return {
        "days_used": len(daily_totals),
        "predicted_next_week_expense": round(float(total_prediction), 2),
        "daily_predictions": [round(float(p), 2) for p in predictions],
    }