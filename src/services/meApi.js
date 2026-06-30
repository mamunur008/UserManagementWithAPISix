import { http, unwrap } from "./httpClient.js";
export const meApi = { getMe: () => http.get("/me").then(unwrap) };
