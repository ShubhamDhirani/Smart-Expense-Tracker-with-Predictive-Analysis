from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import date
from app.database import get_db
from app import models
from app.security import get_current_user

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("/monthly") #Monthly Analytics API
def monthly_summary(
    year: int,
    month: int,
    db: Session = Depends(get_db),
    user_email: str = Depends(get_current_user),
):
    user = db.query(models.User).filter(models.User.email == user_email).first()

    total = (
        db.query(func.sum(models.Expense.amount))
        .filter(models.Expense.user_id == user.id)
        .filter(func.extract("year",models.Expense.date) == year)
        .filter(func.extract("month", models.Expense.date) == month)
        .scalar()
    )

    return {
        "year": year,
        "month": month,
        "total_expense": total or 0,
    }

@router.get("/category")  #Category-wise Analytics API
def category_summary(
    year: int,
    month: int,
    db: Session = Depends(get_db),
    user_email: str = Depends(get_current_user),
):
    user = db.query(models.User).filter(models.User.email == user_email).first()

    results = (
        db.query(
            models.Expense.category,
            func.sum(models.Expense.amount).label("total"),
        )
        .filter(models.Expense.user_id == user.id)
        .filter(func.extract("year", models.Expense.date) == year)
        .filter(func.extract("month", models.Expense.date) == month)
        .group_by(models.Expense.category)
        .all()
    )

    return[
        {"category": r.category, "total": r.total}
        for r in results
    ]