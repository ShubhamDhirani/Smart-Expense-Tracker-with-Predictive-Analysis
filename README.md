# Smart Expense Tracker with Predictive Analytics

A full-stack expense tracking web application with intelligent analytics and AI-based expense forecasting. Built using FastAPI, React, SQLAlchemy, and Tailwind CSS, the system allows users to securely manage expenses, visualize spending patterns, and predict future expenses using machine learning.

## Features

### **Authentication and Security**

   - JWT-based user authentication (register & login)
   - Secure password hashing (bcrypt)
   - Protected API routes

### **Expense Management**

   - Add, edit, and delete expenses
   - Structured data model (amount, category, payment mode, date, description)
   - Server-side validation using FastAPI + Pydantic   
   - Persistent storage using SQLite via SQLAlchemy ORM

### **Analytics Dashboard**

   - Monthly total expense summary
   - Category-wise breakdown using interactive charts
   - Data visualisations using Recharts
   - Dark mode support

### **AI Expense Prediction**

   - Machine Learning based next month expense prediction
   - Uses historical monthly expense data
   - Modular prediction service (extensible for advanced time-series models)

### **Frontend**

   - Built with React + Vite
   - Styled using Tailwind CSS
   - Navigation Tabs (Dashboard, Expenses, Analytics, Prediction)
   - Dark mode toggle
   - Modern responsive layout


## Tech Stack

-**Backend** : FastAPI, SQLAlchemy ORM, SQLite, JWT Authentication, Passlib (bcrypt), Pydantic, Scikit-learn (prediction)
-**Frontend** : React (Vite), Tailwind CSS, Axios, Recharts
-**Tooling** : Git and Github, VS Code, REST APIs