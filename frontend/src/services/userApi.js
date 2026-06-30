import { http, unwrap } from "./httpClient.js";

export const userApi = {
  list: () => http.get("/users").then(unwrap),
  get: (id) => http.get(`/users/${encodeURIComponent(id)}`).then(unwrap),
  create: (payload) => http.post("/users", payload).then(unwrap),
  update: (id, payload) =>
    http.put(`/users/${encodeURIComponent(id)}`, payload).then(unwrap),
  remove: (id) => http.delete(`/users/${encodeURIComponent(id)}`).then(unwrap),
  assignRoles: (id, roles) =>
    http.post(`/users/${encodeURIComponent(id)}/roles`, { roles }).then(unwrap),
};
