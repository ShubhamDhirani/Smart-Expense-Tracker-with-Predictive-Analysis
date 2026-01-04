from sqlalchemy import Column, Integer, String, Float, Date, ForeignKey
from sqlalchemy.orm import relationship
from .database import Base
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key = True, index = True)
    email = Column(String, unique=True, index = True)
    password = Column(String)
    created_at = Column(String)

    expenses = relationship("Expense", back_populates="user")

class Expense(Base):
    __tablename__ = "expenses"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    amount = Column(Float)
    category = Column(String) 
    payment_mode = Column(String) 
    date = Column(Date)
    description = Column(String)

    user = relationship("User", back_populates="expenses")  