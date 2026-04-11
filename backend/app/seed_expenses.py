"""
Synthetic Expense Data Generator

This script generates realistic expense data for the last 6 months
based on predefined categories and probabilistic spending behavior.

Purpose:
- Populate database for analytics and ML
- Simulate real-world financial patterns
- Ensure consistent and clean dataset

Usage:
    python -m app.seed_expenses
"""
import random 
from datetime import datetime, timedelta

from app.database import SessionLocal
from app import models

PAYMENT_MODES = [
    "Cash",
    "UPI",
    "Credit Card",
    "Debit Card",
    "Net Banking",
    "Wallet",
]

def seed_expenses():
    db = SessionLocal()

    try:
        user = db.query(models.User).first()
        if not user:
            print("No user found. Create a user first.")
            return
        
        db.query(models.Expense).delete()
        db.commit()
        print("Old expenses cleared")

        categories = db.query(models.Category).all()
        category_map = {cat.name: cat.id for cat in categories}

        today = datetime.today()
        start_date = today - timedelta(days=180)

        current_date = start_date

        expenses_to_add = []

        while current_date <= today:
            for category_name,category_id in category_map.items():

                if category_name == "Food":
                    if random.random() < 0.7:
                        amount = random.randint(100,500)

                elif category_name == "Transport":
                    if random.random() < 0.5:
                        amount = random.randint(50,300)

                elif category_name == "Rent":
                    if current_date.day == 1:
                        amount = random.randint(8000, 20000)

                elif category_name == "Utilities":
                    if current_date.day == 5:
                        amount = random.randint(1000, 5000)

                elif category_name == "Entertainment":
                    if random.random() < 0.2:
                        amount = random.randint(200, 1000)

                elif category_name == "Shopping":
                    if random.random() < 0.3:
                        amount = random.randint(300, 3000)

                elif category_name == "Other":
                    if random.random() < 0.1:
                        amount = random.randint(100, 2000)

                else:
                    continue

                # ⚠️ IMPORTANT: ensure amount exists
                if 'amount' in locals():
                    expense = models.Expense(
                        user_id=user.id,
                        amount=amount,
                        category_id=category_id,
                        payment_mode=random.choice(PAYMENT_MODES),
                        date=current_date.date(),
                        description=""
                    )

                    expenses_to_add.append(expense)

                    del amount  # reset for next iteration

            current_date += timedelta(days=1)

        # ✅ Bulk insert
        db.add_all(expenses_to_add)
        db.commit()

        print(f"{len(expenses_to_add)} expenses added successfully!")

    finally:
        db.close()

if __name__ == "__main__":
    seed_expenses()        