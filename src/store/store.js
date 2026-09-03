import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import brandReducer from "./slices/brandSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    brand: brandReducer,
  },
});

