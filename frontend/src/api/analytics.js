import API from "./api";

export const getMonthlyAnalytics = (year, month) =>
  API.get("/analytics/monthly", { params: { year, month } });

export const getCategoryAnalytics = (year, month) =>
  API.get("/analytics/category", { params: { year, month } });