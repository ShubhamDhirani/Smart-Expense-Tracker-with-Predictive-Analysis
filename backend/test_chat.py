from app.database import SessionLocal
from app import models

from app.services.chat_service import (
    ask_financial_assistant,
)

db = SessionLocal()

user = db.query(models.User).first()

response = ask_financial_assistant(
    db=db,
    user_id=user.id,
    question="What is my highest spending category?"
)

print(response)

db.close()