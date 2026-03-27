import API from "./api";

export const addExpense = (data) => API.post("/expenses", data );

export const getExpenses = () => API.get("/expenses");

export const deleteExpense = (id) => API.delete(`/expenses/${id}`);

export const updateExpense = (id, data) =>
  API.put(`/expenses/${id}`, data);