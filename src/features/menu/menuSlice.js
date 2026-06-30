import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { meApi } from "../../services/meApi.js";

export const fallbackAdminMenus = [
  { id: "dashboard", name: "Dashboard", url: "/", icon: "⌂", orderIndex: 0 },
  { id: "users", name: "Users", url: "/users", icon: "👤", orderIndex: 1 },
  { id: "roles", name: "Roles", url: "/roles", icon: "♡", orderIndex: 2 },
  { id: "permissions", name: "Permissions", url: "/permissions", icon: "🔐", orderIndex: 3 },
  { id: "user-roles", name: "User Roles", url: "/user-roles", icon: "🔗", orderIndex: 4 },
  { id: "role-permissions", name: "Role Permissions", url: "/role-permissions", icon: "✅", orderIndex: 5 },
  { id: "menu-items", name: "Menu Items", url: "/menu-items", icon: "☰", orderIndex: 6 },
  { id: "organizations", name: "Organizations", url: "/organizations", icon: "🏢", orderIndex: 7 },
  { id: "payment-accounts", name: "Payment Accounts", url: "/payment-accounts", icon: "💳", orderIndex: 8 }
];

function normalizeMenus(payload) {
  const menus = payload?.menus ?? payload?.menuItems ?? payload?.items ?? [];
  if (!Array.isArray(menus) || menus.length === 0) return fallbackAdminMenus;
  return menus
    .filter((menu) => menu.active !== false && menu.voided !== true)
    .map((menu) => ({
      id: menu.id ?? menu.name ?? menu.url,
      name: menu.name,
      url: menu.url,
      icon: menu.icon ?? "•",
      orderIndex: menu.orderIndex ?? menu.order_index ?? 0,
      parentId: menu.parentId ?? menu.parent_id ?? null
    }))
    .sort((a, b) => a.orderIndex - b.orderIndex);
}

export const fetchMe = createAsyncThunk("menu/fetchMe", async () => {
  const me = await meApi.getMe();
  return { me, menus: normalizeMenus(me), source: Array.isArray(me?.menus) && me.menus.length > 0 ? "server" : "fallback" };
});

const slice = createSlice({
  name: "menu",
  initialState: { items: fallbackAdminMenus, source: "fallback", me: null, loading: false, error: null },
  reducers: {
    setMenus(state, action) {
      const menus = Array.isArray(action.payload) ? action.payload : [];
      if (menus.length === 0) { state.items = fallbackAdminMenus; state.source = "fallback"; return; }
      state.items = menus; state.source = "server";
    },
    resetMenus(state) { state.items = fallbackAdminMenus; state.source = "fallback"; state.me = null; state.loading = false; state.error = null; }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMe.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchMe.fulfilled, (state, action) => { state.loading = false; state.me = action.payload.me; state.items = action.payload.menus; state.source = action.payload.source; })
      .addCase(fetchMe.rejected, (state, action) => { state.loading = false; state.error = action.error?.message ?? "Failed to load menu"; state.items = fallbackAdminMenus; state.source = "fallback"; });
  }
});

export const { setMenus, resetMenus } = slice.actions;
export default slice.reducer;
