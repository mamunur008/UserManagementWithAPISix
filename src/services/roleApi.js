import { http, unwrap } from "./httpClient.js";
export const roleApi = {
  list: () => http.get("/roles").then(unwrap),
  get: (id) => http.get(`/roles/${id}`).then(unwrap),
  create: (payload) => http.post("/roles", payload, { headers: { "Idempotency-Key": crypto.randomUUID() } }).then(unwrap),
  updateOrgTypes: (id, assignableOrgTypeIds) => http.put(`/roles/${id}/org-types`, { assignableOrgTypeIds }).then(unwrap)
};
