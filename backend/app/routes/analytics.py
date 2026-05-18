from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import date
from app.database import get_db
from app import models
from app.security import get_current_user
from app.services.analytics_service import (
    get_monthly_total,
    get_category_breakdown,
)
from typing import Optional
from datetime import date
from app.services.analytics_service import get_trend_data




router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("/monthly") #Monthly Analytics API
def monthly_summary(
    year: Optional[int] = None,
    month: Optional[int] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Session = Depends(get_db),
    user_email: str = Depends(get_current_user),
):
    user = db.query(models.User).filter(models.User.email == user_email).first()

    total = get_monthly_total(db, user.id, year, month, start_date, end_date)

    return {
        "year": year,
        "month": month,
        "total_expense": total or 0,
    }

@router.get("/category")  #Category-wise Analytics API
def category_summary(
    year: Optional[int] = None,
    month: Optional[int] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Session = Depends(get_db),
    user_email: str = Depends(get_current_user),
):
    user = db.query(models.User).filter(models.User.email == user_email).first()

    return get_category_breakdown(db, user.id, year, month, start_date, end_date)


@router.get("/trend")
def trend_data(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Session = Depends(get_db),
    user_email: str = Depends(get_current_user),

):
    user = db.query(models.User).filter(models.User.email == user_email).first()

    return get_trend_data(db, user.id, start_date, end_date)

