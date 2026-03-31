from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database import get_db
from app import models
from app.security import get_current_user

router = APIRouter(prefix="/categories", tags=["Categories"])


class CategoryCreate(BaseModel):
    name: str
    type: str
    frequency: str | None = None


# ✅ Get all categories (global + user-specific)
@router.get("/")
def get_categories(
    db: Session = Depends(get_db),
    user_email: str = Depends(get_current_user)
):
    user = db.query(models.User).filter(models.User.email == user_email).first()

    categories = db.query(models.Category).filter(
        (models.Category.is_global == True) |
        (models.Category.user_id == user.id)
    ).all()

    return categories


# ✅ Create new category (user-defined)
@router.post("/")
def create_category(
    category: CategoryCreate,
    db: Session = Depends(get_db),
    user_email: str = Depends(get_current_user)
):
    user = db.query(models.User).filter(models.User.email == user_email).first()

    new_category = models.Category(
        name=category.name,
        type=category.type,
        frequency=category.frequency,
        is_global=False,
        user_id=user.id
    )

    db.add(new_category)
    db.commit()
    db.refresh(new_category)

    return new_category
