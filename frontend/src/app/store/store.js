import { configureStore } from '@reduxjs/toolkit';
import sessionReducer from '../../features/session/sessionSlice.js';
import menuReducer from '../../features/menu/menuSlice.js';

export const store = configureStore({
  reducer: {
    session: sessionReducer,
    menu: menuReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false
    })
});
