// features/products/productSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
const Base_Url = import.meta.env.VITE_BASEAPI;

export const fetchCsrf = createAsyncThunk(
  "csrf/fetchCsrf",
  async (_, thunkAPI) => {
    try {

        console.log("function running")
      const res = await fetch(`${Base_Url}/security/csrf`, {
        credentials: "include"
      });

      const data = await res.json();
      console.log("csrf response", data);

      if (!res.ok) throw new Error("Failed to fetch");

      return data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);
const csrfSlice = createSlice({
  name: "csrf",
  initialState: {
    csrf: null
  },
  reducers: {},

  extraReducers: (builder) => {
    builder
      .addCase(fetchCsrf.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCsrf.fulfilled, (state, action) => {
        state.loading = false;
        state.csrf = action.payload.csrf_token;
      })
      .addCase(fetchCsrf.rejected, (state, action) => {
        state.loading = false;
        state.error = "Error while fetching CSRF token";
      });
  }
});

export default csrfSlice.reducer;
