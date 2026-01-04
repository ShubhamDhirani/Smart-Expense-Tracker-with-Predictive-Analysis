MVP FEATURES

1. User authentication
   - Signup
   - Login

2. Expense management
   - Add expense
   - Edit expense
   - Delete expense
   - Categories
   - Date, amount, payment mode

3. Analytics
   - Monthly total expense
   - Category-wise expense
   - Month-over-month comparison

4. Prediction
   - Predict next month total expense

5. Frontend
   - Login page
   - Dashboard
   - Analytics charts




STRUCTURE OF THE APP:

    Frontend (React)
       ↓
    Backend (FastAPI)
       ↓
    Database (SQLite/PostgreSQL)



DATABASE DESIGN:

    Table 1 : Users

        id         -  uniques user id
        email      -  login email
        password   -  encrypted password
        created_at -  account creation time

    Table 2 : Expenses

        id           -  expense id
        user_id      -  who spent
        amount       -  money spent
        category     -  food, travel, etc
        payment_mode -  cash, card, UPI
        date         -  when money was spent
        description  -  optional note


LIST OF APIs:

    POST /auth/register   -> create account
    POST /auth/login      -> login user

    POST /expenses        -> add expense 
    GET /expenses         -> view expenses
    PUT /expenses/{id}    -> edit expense
    DELETE /expenses/{id} -> delete expense

    GET /analytics/monthly
    GET /analytics/category

    GET /predict/next-month