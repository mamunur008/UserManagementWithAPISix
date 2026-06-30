import { http, unwrap } from "./httpClient.js";
export const organizationApi = {
  list: () => http.get("/organizations").then(unwrap),
  create: (payload) => http.post("/organizations", payload).then(unwrap),
  update: (id, payload) => http.put(`/organizations/${id}`, payload).then(unwrap),
  types: () => http.get("/organization-types").then(unwrap),
  createType: (payload) => http.post("/organization-types", payload).then(unwrap)
};
