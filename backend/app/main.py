from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine
from .models import Base
from .routes import auth, expenses, analytics, prediction
from app.seed import seed_categories
from app.routes import category

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials = True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

app.include_router(auth.router)
app.include_router(expenses.router)
app.include_router(analytics.router)
app.include_router(prediction.router)
app.include_router(category.router)

@app.get("/")
def root():
    return {"message": "Expense Tracker API is running"}

@app.on_event("startup")
def startup_event():
    seed_categories()

    