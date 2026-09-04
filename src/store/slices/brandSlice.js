import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  connection: "unknown", // 'connected' | 'not connected' | 'unknown'
  brands: null, // null | 'single brand' | Array<{ brand_id, brand_name }>
  currentBrand: null, // { brand_id, brand_name } | null
  loading: false,
  error: null,
};

export const brandSlice = createSlice({
  name: "brand",
  initialState,
  reducers: {
    setBrandConnection: (state, action) => {
      state.connection = action.payload?.connection || "not connected";
      state.brands = action.payload?.brands ?? null;
      if (action.payload?.currentBrand) {
        state.currentBrand = action.payload.currentBrand;
      } else if (action.payload?.brands === "single brand") {
        state.currentBrand = { brand_id: "default", brand_name: "Connected Brand" };
      }
      state.loading = false;
      state.error = null;
    },
    setCurrentBrand: (state, action) => {
      state.currentBrand = action.payload;
      state.connection = "connected";
    },
    setBrandLoading: (state, action) => {
      state.loading = action.payload;
    },
    setBrandError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearBrandConnection: (state) => {
      state.connection = "not connected";
      state.brands = null;
      state.currentBrand = null;
      state.loading = false;
      state.error = null;
    },
  },
});

export const {
  setBrandConnection,
  setCurrentBrand,
  setBrandLoading,
  setBrandError,
  clearBrandConnection,
} = brandSlice.actions;

export default brandSlice.reducer;
