import API from "./api";

export const getNextDayPrediction = () =>
  API.get("/predict/next-day");

export const getNextWeekPrediction = () =>
  API.get("/predict/next-week");

export const getNextMonthPrediction = () =>
  API.get("/predict/next-month");

export const getMetrics = () =>
  API.get("/predict/metrics");