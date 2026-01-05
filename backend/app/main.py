from fastapi import FastAPI
from .database import engine
from .models import Base
from .routes import auth, expenses

app = FastAPI()

Base.metadata.create_all(bind=engine)

app.include_router(auth.router)
app.include_router(expenses.router)

@app.get("/")
def root():
    return {"message": "Expense Tracker API is running"}