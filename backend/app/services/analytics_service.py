from sqlalchemy.orm import Session
from sqlalchemy import func
from app import models
from typing import Optional
from datetime import date

def get_monthly_total(db: Session, user_id: int, year: Optional[int] = None, month: Optional[int] = None, start_date: Optional[date] = None, end_date: Optional[date] = None):
    query = db.query(func.sum(models.Expense.amount)).filter(
        models.Expense.user_id == user_id
    )

    if start_date and end_date:
        query = query.filter(
            models.Expense.date >= start_date,
            models.Expense.date <= end_date
        )
    elif year and month:
        query = query.filter(
            func.extract("year", models.Expense.date) == year,
            func.extract("month", models.Expense.date) == month
        )

    total = query.scalar()

    return total or 0

def get_category_breakdown(db: Session, user_id: int, year: Optional[int] = None, month: Optional[int] = None, start_date: Optional[date] = None, end_date: Optional[date] = None):
    query = db.query(
        models.Category.name,
        func.sum(models.Expense.amount).label("total"),
    ).join(models.Category).filter(
       models.Expense.user_id == user_id
    )

    if start_date and end_date:
        query = query.filter(
            models.Expense.date >= start_date,
            models.Expense.date <= end_date
        )
    elif year and month:
        query = query.filter(
            func.extract("year", models.Expense.date) == year,
            func.extract("month", models.Expense.date) == month
        )

    results = query.group_by(models.Category.name).all()

    return [
        {"category": r.name, "total": r.total}
        for r in results
    ]

def get_trend_data(
        db: Session,
        user_id: int,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
):
    query = db.query(
        models.Expense.date,
        func.sum(models.Expense.amount).label("total"),
    ).filter(models.Expense.user_id == user_id)

    if start_date and end_date:
        query = query.filter(
            models.Expense.date >= start_date,
            models.Expense.date <= end_date
        )

    results = (
        query
        .group_by(models.Expense.date)
        .order_by(models.Expense.date)
        .all()
    )    

    return [
        {
            "date": r.date.strftime("%Y-%m-%d"),
            "total": r.total
        }
        for r in results
    ]