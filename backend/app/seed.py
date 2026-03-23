from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models import Category

def seed_categories():
    db: Session = SessionLocal()

    default_categories = [
        {"name": "Food", "type": "Flexible"},
        {"name": "Transport", "type": "Flexible"},
        {"name": "Rent", "type": "Fixed", "frequency": "Monthly"},
        {"name": "Utilities", "type": "Fixed", "frequency": "Monthly"},
        {"name": "Entertainment", "type": "Flexible"},
        {"name": "Shopping", "type": "Flexible"},
        {"name": "Other", "type": "Flexible"},
    ]

    for cat in default_categories:
        exists = db.query(Category).filter(
            Category.name == cat["name"],
            Category.is_global == True
        ).first()

        if not exists:
            new_cat = Category(
                name = cat["name"],
                type = cat["type"],
                frequency=cat.get("frequency"),
                is_global=True
            )
            db.add(new_cat)
    db.commit()
    db.close()        