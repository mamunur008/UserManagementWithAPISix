// services/userService.js
import http from "../utils/http"; // adjust path

const USERS_ENDPOINT = "/api/admin/users";

function normalizeUsers(response) {
  const data = response?.data;

  // Supports multiple API response shapes
  if (Array.isArray(data)) return data;

  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.result)) return data.result;

  return [];
}

function getErrorMessage(error) {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.title ||
    error?.message ||
    "Failed to load users."
  );
}

/*
export async function getUsersNormal() {
  try {
    const response = await http.get(USERS_ENDPOINT);
    return normalizeUsers(response);
  } catch (error) {
    console.error("Failed to load users", error);

    throw new Error(getErrorMessage(error));
  }
} */

export async function getUsers(params = {}) {
  try {
    const response = await http.get("/api/admin/users", {
      params: {
        page: params.page ?? 1,
        pageSize: params.pageSize ?? 20,
        search: params.search ?? "",
        ...params,
      },
    });

    return {
      rows:
        response?.data?.items || response?.data?.data || response?.data || [],

      total: response?.data?.total || response?.data?.totalCount || 0,
    };
  } catch (error) {
    console.error("Failed to load users", error);

    throw new Error(
      error?.response?.data?.message ||
        error?.response?.data?.title ||
        error?.message ||
        "Failed to load users.",
    );
  }
}
