import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import brandReducer from "./slices/brandSlice";
import csrfReducer from "./slices/csrfSlice.js";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    brand: brandReducer,
    csrf: csrfReducer,
  },
});

