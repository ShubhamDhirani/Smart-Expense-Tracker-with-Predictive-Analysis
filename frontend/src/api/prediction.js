import API from "./api";

export const getPrediction = () => API.get("/predict/next-month");