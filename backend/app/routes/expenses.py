from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import date
from pydantic import BaseModel
from app.database import get_db
from app import models
from app.security import get_current_user

router = APIRouter(prefix="/expenses", tags=["Expenses"])


# ✅ Request model
class ExpenseCreate(BaseModel):
    amount: float
    category_id: int
    payment_mode: str
    date: date
    description: str = ""


# ✅ CREATE
@router.post("/")
def add_expense(
    expense: ExpenseCreate,
    db: Session = Depends(get_db),
    user_email: str = Depends(get_current_user),
):
    user = db.query(models.User).filter(models.User.email == user_email).first()

    expense_obj = models.Expense(
        user_id=user.id,
        amount=expense.amount,
        category_id=expense.category_id,
        payment_mode=expense.payment_mode,
        date=expense.date,
        description=expense.description,
    )

    db.add(expense_obj)
    db.commit()
    db.refresh(expense_obj)

    return {"message": "Expense added successfully"}


# ✅ READ
@router.get("/")
def get_expenses(
    db: Session = Depends(get_db),
    user_email: str = Depends(get_current_user),
):
    user = db.query(models.User).filter(models.User.email == user_email).first()

    return db.query(models.Expense).filter(
        models.Expense.user_id == user.id
    ).all()


# ✅ UPDATE
@router.put("/{expense_id}")
def update_expense(
    expense_id: int,
    expense: ExpenseCreate,
    db: Session = Depends(get_db),
    user_email: str = Depends(get_current_user),
):
    user = db.query(models.User).filter(models.User.email == user_email).first()

    expense_obj = db.query(models.Expense).filter(
        models.Expense.id == expense_id,
        models.Expense.user_id == user.id,
    ).first()

    if not expense_obj:
        raise HTTPException(status_code=404, detail="Expense not found")

    expense_obj.amount = expense.amount
    expense_obj.category_id = expense.category_id
    expense_obj.payment_mode = expense.payment_mode
    expense_obj.date = expense.date
    expense_obj.description = expense.description

    db.commit()

    return {"message": "Expense updated successfully"}


# ✅ DELETE
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