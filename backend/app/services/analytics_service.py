from sqlalchemy.orm import Session
from sqlalchemy import func
from app import models

def get_monthly_total(db: Session, user_id: int, year: int, month: int):
    total = (
        db.query(func.sum(models.Expense.amount))
        .filter(models.Expense.user_id == user_id)
        .filter(func.extract("year",models.Expense.date)== year)
        .filter(func.extract("month", models.Expense.date) == month)
        .scalar()
    )

    return total or 0

def get_category_breakdown(db: Session, user_id: int, year: int, month: int):
    results = (
        db.query(
            models.Category.name,
            func.sum(models.Expense.amount).label("total"),
        )
        .join(models.Category, models.Expense.category_id == models.Category.id)
        .filter(models.Expense.user_id == user_id)
        .filter(func.extract("year", models.Expense.date) == year)
        .filter(func.extract("month", models.Expense.date) == month)
        .group_by(models.Category.name)
        .all()
    )

    return [
        {"category": r.name, "total": r.total}
        for r in results
    ]