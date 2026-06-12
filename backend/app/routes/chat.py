from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app import models
from app.security import get_current_user

from app.services.chat_service import (
    ask_financial_assistant,
)

router = APIRouter(
    prefix="/chat",
    tags=["Chat Assistant"],
)


@router.post("/")
def chat_with_assistant(
    payload: dict,
    db: Session = Depends(get_db),
    user_email: str = Depends(get_current_user),
):

    user = (
        db.query(models.User)
        .filter(models.User.email == user_email)
        .first()
    )

    response = ask_financial_assistant(
        db=db,
        user_id=user.id,
        question=payload["message"],
    )

    return {
        "response": response
    }