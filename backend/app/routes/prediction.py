from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
import numpy as np
from sklearn.linear_model import LinearRegression

from app.database import get_db
from app import models
from app.security import get_current_user

router = APIRouter(prefix="/predict", tags=["Prediction"])

@router.get("/next-month")
def predict_next_month(
    db: Session = Depends(get_db),
    user_email: str = Depends(get_current_user),
):
    user = db.query(models.User).filter(models.User.email == user_email).first()

    results = (
        db.query(
            func.strftime("%Y-%m", models.Expense.date).label("month"),
            func.sum(models.Expense.amount).label("total"),
        )
        .filter(models.Expense.user_id == user.id)
        .group_by("month")
        .order_by("month")
        .all()
    )

    if len(results) < 2:
        raise HTTPException(
            status_code = 400,
            detail="Not enough data to make prediction (need at least 2 months)",
        )
    
    months = []
    totals = []

    for i, r in enumerate(results):
        year, month = map(int, r.month.split("-"))
        months.append([year, month])
        totals.append(r.total)

    X = np.array(months)
    y = np.array(totals)    

    model = LinearRegression()
    model.fit(X, y)

    last_year, last_month = map(int, results[-1].month.split("-"))

    if last_month == 12:
        next_month = 1
        next_year = last_year + 1
    else:
        next_month = last_month + 1
        next_year = last_year
    predicted = model.predict([[next_year, next_month]])[0]        
    predicted = max(predicted,0)

    return {
        "months_used": len(results),
        "predicted_next_month_expense": round(float(predicted), 2),
    }