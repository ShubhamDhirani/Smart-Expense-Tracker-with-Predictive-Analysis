import API from "./api";

export const sendMessage = (message) =>
  API.post("/chat/", {
    message,
  });