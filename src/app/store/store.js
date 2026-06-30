import { configureStore } from "@reduxjs/toolkit";
import sessionSliceReducer from "../../features/session/sessionSlice.js";
import menuSliceReducer from "../../features/menu/menuSlice.js";

export const store = configureStore({
  reducer: {
    session: sessionSliceReducer,
    menu: menuSliceReducer
  },
  devTools: true
});
