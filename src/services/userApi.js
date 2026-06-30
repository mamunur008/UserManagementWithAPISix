import { http, unwrap } from "./httpClient.js";
export const userApi = {
  list: () => http.get("/users").then(unwrap),
  get: (id) => http.get(`/users/${id}`).then(unwrap),
  create: (payload) => http.post("/users", payload, { headers: { "Idempotency-Key": crypto.randomUUID() } }).then(unwrap),
  update: (id, payload) => http.put(`/users/${id}`, payload, { headers: { "Idempotency-Key": crypto.randomUUID() } }).then(unwrap),
  deactivate: (id) => http.post(`/users/${id}/deactivate`, null, { headers: { "Idempotency-Key": crypto.randomUUID() } }).then(unwrap),
  roles: (id) => http.get(`/users/${id}/roles`).then(unwrap),
  assignRole: (userId, roleId) => http.post(`/users/${userId}/roles/${roleId}`, null, { headers: { "Idempotency-Key": crypto.randomUUID() } }).then(unwrap),
  removeRole: (userId, roleId) => http.delete(`/users/${userId}/roles/${roleId}`, { headers: { "Idempotency-Key": crypto.randomUUID() } }).then(unwrap)
};
