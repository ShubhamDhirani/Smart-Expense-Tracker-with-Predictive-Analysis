import API from "./api";

export const getCategories = () => API.get("/categories");

export const createCategory = (data) => API.post("/categories/", data);
