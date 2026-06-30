import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { loginWithKeycloak, logoutFromKeycloak, oidcUserManager } from "../../services/oidc.js";

const initialState = {
  accessToken: null,
  refreshToken: null,
  idToken: null,
  user: null,
  isAuthenticated: false,
  loading: false,
  bootstrapped: false,
  error: null
};

function mapOidcUser(oidcUser) {
  if (!oidcUser || oidcUser.expired) {
    return { ...initialState, loading: false, bootstrapped: true };
  }
  return {
    accessToken: oidcUser.access_token ?? null,
    refreshToken: oidcUser.refresh_token ?? null,
    idToken: oidcUser.id_token ?? null,
    user: oidcUser.profile ?? null,
    isAuthenticated: Boolean(oidcUser.access_token),
    loading: false,
    bootstrapped: true,
    error: null
  };
}

export const loadSession = createAsyncThunk("session/loadSession", async () => {
  const oidcUser = await oidcUserManager.getUser();
  return mapOidcUser(oidcUser);
});

export const handleCallback = createAsyncThunk("session/handleCallback", async () => {
  const oidcUser = await oidcUserManager.signinRedirectCallback();
  window.history.replaceState({}, document.title, "/");
  return mapOidcUser(oidcUser);
});

export const login = createAsyncThunk("session/login", async () => {
  await loginWithKeycloak();
});

export const logout = createAsyncThunk("session/logout", async () => {
  await logoutFromKeycloak();
});

const slice = createSlice({
  name: "session",
  initialState,
  reducers: {
    setSession(state, action) {
      state.accessToken = action.payload?.accessToken ?? null;
      state.refreshToken = action.payload?.refreshToken ?? null;
      state.idToken = action.payload?.idToken ?? null;
      state.user = action.payload?.user ?? null;
      state.isAuthenticated = Boolean(action.payload?.accessToken);
      state.loading = false;
      state.bootstrapped = true;
      state.error = null;
    },
    clearSession() {
      return { ...initialState, bootstrapped: true };
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadSession.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(loadSession.fulfilled, (state, action) => { Object.assign(state, action.payload); })
      .addCase(loadSession.rejected, (state, action) => {
        state.loading = false; state.bootstrapped = true; state.isAuthenticated = false; state.error = action.error?.message ?? "Failed to load session";
      })
      .addCase(handleCallback.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(handleCallback.fulfilled, (state, action) => { Object.assign(state, action.payload); })
      .addCase(handleCallback.rejected, (state, action) => {
        state.loading = false; state.bootstrapped = true; state.isAuthenticated = false; state.error = action.error?.message ?? "Keycloak callback failed";
      });
  }
});

export const { setSession, clearSession } = slice.actions;
export default slice.reducer;
