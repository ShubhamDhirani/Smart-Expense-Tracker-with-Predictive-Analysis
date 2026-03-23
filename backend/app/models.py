from sqlalchemy import Column, Integer, String, Float, Date, ForeignKey, Boolean, DateTime
from sqlalchemy.orm import relationship
from .database import Base
from datetime import datetime

class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True,index = True)
    name = Column(String, nullable=False)
    type = Column(String, nullable=False)
    frequency = Column(String, nullable=True)
    is_global = Column(Boolean, default=False)
    user_id = Column(Integer, ForeignKey("users.id"),nullable=True)

    created_at = Column(DateTime, default= datetime.utcnow)
    user= relationship("User")

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
    category_id = Column(Integer, ForeignKey("categories.id"))
    is_recurring = Column(Boolean, default = False)
    last_added_date = Column(Date, nullable = True)
    category = relationship("Category") 
    payment_mode = Column(String) 
    date = Column(Date)
    description = Column(String)

    user = relationship("User", back_populates="expenses")  