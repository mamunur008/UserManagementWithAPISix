import { http, unwrap } from "./httpClient.js";
export const permissionApi = {
  list: () => http.get("/permissions").then(unwrap),
  get: (id) => http.get(`/permissions/${id}`).then(unwrap),
  create: (payload) => http.post("/permissions", payload).then(unwrap)
};
