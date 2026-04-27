import API from "./api";

export const getMonthlyAnalytics = (params) =>
  API.get("/analytics/monthly", { params });

export const getCategoryAnalytics = (params) =>
  API.get("/analytics/category", { params });