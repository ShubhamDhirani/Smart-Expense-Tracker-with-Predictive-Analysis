import numpy as np

from sqlalchemy.orm import Session
from sqlalchemy import func

from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor

from app import models
from sklearn.metrics import (
    mean_absolute_error,
    mean_squared_error,
    r2_score,
)

from sklearn.model_selection import train_test_split

WINDOW_SIZE = 3

def get_daily_totals(db: Session, user_id: int):
    results = (
        db.query(
            models.Expense.date,
            func.sum(models.Expense.amount).label("total"),
        )
        .filter(models.Expense.user_id == user_id)
        .group_by(models.Expense.date)
        .order_by(models.Expense.date)
        .all()
    )

    return results


def prepare_features(results):
    daily_totals = [r.total for r in results]

    X = []
    y = []

    for i in range(len(daily_totals) - WINDOW_SIZE):
        window = daily_totals[i:i + WINDOW_SIZE]

        avg = sum(window) / WINDOW_SIZE
        day_index = results[i + WINDOW_SIZE].date.weekday()

        features = window + [avg, day_index]

        X.append(features)
        y.append(daily_totals[i + WINDOW_SIZE])

    return np.array(X), np.array(y), daily_totals


def train_models(X, y):
    linear_model = LinearRegression()
    linear_model.fit(X, y)

    rf_model = RandomForestRegressor(
        n_estimators=100,
        random_state=42
    )

    rf_model.fit(X, y)

    return linear_model, rf_model

def forecast_future_expenses(
    linear_model,
    rf_model,
    daily_totals,
    days_to_predict,
):
    predictions = []

    current_window = daily_totals[-WINDOW_SIZE:].copy()

    for day in range(days_to_predict):

        avg = sum(current_window) / WINDOW_SIZE
        day_index = day % 7

        features = current_window + [avg, day_index]

        linear_pred = linear_model.predict([features])[0]
        rf_pred = rf_model.predict([features])[0]

        next_pred = (linear_pred + rf_pred) / 2
        next_pred = max(next_pred, 0)

        predictions.append(next_pred)

        current_window.pop(0)
        current_window.append(next_pred)

    return predictions

def evaluate_models(X,y):

    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.2,
        random_state = 42,
    )

    linear_model = LinearRegression()
    linear_model.fit(X_train,y_train)

    rf_model = RandomForestRegressor(
        n_estimators = 100,
        random_state = 42,
    )

    rf_model.fit(X_train, y_train)

    linear_preds = linear_model.predict(X_test)
    rf_preds = rf_model.predict(X_test)

    metrics = {
        "linear_regression": {
            "mae": round(
                mean_absolute_error(y_test, linear_preds), 2
            ),
            "rmse":round(
                np.sqrt(mean_squared_error(y_test, linear_preds)), 2
            ),
            "r2_score": round(
                r2_score(y_test, linear_preds), 2
            ),    
        },

        "random_forest": {
            "mae": round(
                mean_absolute_error(y_test, rf_preds), 2
            ),
            "rmse": round(
                np.sqrt(mean_squared_error(y_test, rf_preds)), 2
            ),
            "r2_score": round(
                r2_score(y_test, rf_preds), 2
            ),    
        }
    }

    return metrics



