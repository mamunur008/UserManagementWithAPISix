import { http, unwrap } from "./httpClient.js";

export const authApi = {
  login: (payload) => http.post("/auth/login", payload).then(unwrap),
  logout: () => http.post("/auth/logout").then(unwrap),
  me: () => http.get("/me").then(unwrap),
};
