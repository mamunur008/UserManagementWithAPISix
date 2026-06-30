import { http, unwrap } from "./httpClient.js";

export const userRoleApi = {
  list: () => http.get("/user-roles").then(unwrap),
  get: (userId) =>
    http.get(`/user-roles/${encodeURIComponent(userId)}`).then(unwrap),
  save: (userId, roles) =>
    http
      .post(`/user-roles/${encodeURIComponent(userId)}`, { roles })
      .then(unwrap),
};
