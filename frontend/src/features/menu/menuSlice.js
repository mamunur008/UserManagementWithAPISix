import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [],
  loading: false,
  error: null
};

const menuSlice = createSlice({
  name: 'menu',
  initialState,
  reducers: {
    setMenus: (state, action) => {
      state.items = Array.isArray(action.payload) ? action.payload : [];
      state.loading = false;
      state.error = null;
    },

    clearMenus: (state) => {
      state.items = [];
      state.loading = false;
      state.error = null;
    },

    setMenuLoading: (state, action) => {
      state.loading = action.payload;
    },

    setMenuError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    }
  }
});

export const { setMenus, clearMenus, setMenuLoading, setMenuError } = menuSlice.actions;
export default menuSlice.reducer;
