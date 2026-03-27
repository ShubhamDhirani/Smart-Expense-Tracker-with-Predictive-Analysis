from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import date
from app.database import get_db
from app import models
from app.security import get_current_user

router = APIRouter(prefix="/expenses", tags=["Expenses"])


@router.post("/")
def add_expense(
    amount: float,
    category_id: int,
    payment_mode: str,
    date: date,
    description: str = "",
    db: Session = Depends(get_db),
    user_email: str = Depends(get_current_user),
):
    user = db.query(models.User).filter(models.User.email == user_email).first()

    expense = models.Expense(
        user_id=user.id,
        amount=amount,
        category_id=category_id,
        payment_mode=payment_mode,
        date=date,
        description=description,
    )

    db.add(expense)
    db.commit()
    db.refresh(expense)

    return {"message": "Expense added successfully"}


@router.get("/")
def get_expenses(
    db: Session = Depends(get_db),
    user_email: str = Depends(get_current_user),
):
    user = db.query(models.User).filter(models.User.email == user_email).first()
    expenses = db.query(models.Expense).filter(models.Expense.user_id == user.id).all()
    return expenses


@router.put("/{expense_id}")
def update_expense(
    expense_id: int,
    amount: float,
    category_id: int,
    payment_mode: str,
    date: date,
    description: str = "",
    db: Session = Depends(get_db),
    user_email: str = Depends(get_current_user),
):
    user = db.query(models.User).filter(models.User.email == user_email).first()
    expense = db.query(models.Expense).filter(
        models.Expense.id == expense_id,
        models.Expense.user_id == user.id,
    ).first()

    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")

    expense.amount = amount
    expense.category_id = category_id
    expense.payment_mode = payment_mode
    expense.date = date
    expense.description = description

    db.commit()
    return {"message": "Expense updated successfully"}


@router.delete("/{expense_id}")
def delete_expense(
    expense_id: int,
    db: Session = Depends(get_db),
    user_email: str = Depends(get_current_user),
):
    user = db.query(models.User).filter(models.User.email == user_email).first()
    expense = db.query(models.Expense).filter(
        models.Expense.id == expense_id,
        models.Expense.user_id == user.id,
    ).first()

    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")

    db.delete(expense)
    db.commit()
    return {"message": "Expense deleted successfully"}