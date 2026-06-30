import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  token: localStorage.getItem('access_token') || null,
  accessToken: localStorage.getItem('access_token') || null,
  refreshToken: localStorage.getItem('refresh_token') || null,
  idToken: localStorage.getItem('id_token') || null,
  profile: null,
  me: null,
  error: null
};

const sessionSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {
    loadSession: (state) => {
      const accessToken = localStorage.getItem('access_token');
      const refreshToken = localStorage.getItem('refresh_token');
      const idToken = localStorage.getItem('id_token');

      state.token = accessToken;
      state.accessToken = accessToken;
      state.refreshToken = refreshToken;
      state.idToken = idToken;
      state.error = null;
    },

    setOidcSession: (state, action) => {
      const { accessToken, refreshToken, idToken, profile } = action.payload;

      state.token = accessToken;
      state.accessToken = accessToken;
      state.refreshToken = refreshToken;
      state.idToken = idToken;
      state.profile = profile || null;
      state.error = null;

      if (accessToken) localStorage.setItem('access_token', accessToken);
      if (refreshToken) localStorage.setItem('refresh_token', refreshToken);
      if (idToken) localStorage.setItem('id_token', idToken);
    },

    setMe: (state, action) => {
      state.me = action.payload;
    },

    setSessionError: (state, action) => {
      state.error = action.payload;
    },

    clearSession: (state) => {
      state.token = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.idToken = null;
      state.profile = null;
      state.me = null;
      state.error = null;

      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('id_token');
      localStorage.removeItem('session_id');
    }
  }
});

export const {
  loadSession,
  setOidcSession,
  setMe,
  setSessionError,
  clearSession
} = sessionSlice.actions;

export default sessionSlice.reducer;
