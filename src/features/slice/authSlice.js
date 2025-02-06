import { createSlice } from "@reduxjs/toolkit";
import { decrypt } from "../../utils/encrypt";

const { decryptedData: decryptedToken } = decrypt(
  sessionStorage.getItem("token")
);

const initialUser = sessionStorage.getItem("user") || "";

const authSlice = createSlice({
  name: "auth",
  initialState: {
    isAuthenticated: !!decryptedToken,
    token: decryptedToken,
    user: initialUser,
    pageNumber: 0,
    pageSize: 25,
  },
  reducers: {
    loginSlice: (state, action) => {
      state.isAuthenticated = true;
      state.token = action.payload.token;
      state.user = action.payload.user;
    },
    logoutSlice: (state) => {
      state.isAuthenticated = false;
      state.token = null;
    },
    setPokedData: (state, action) => {
      state.pokedData = action.payload;
    },
    setPageNumber: (state, action) => {
      state.pageNumber = action.payload;
    },
    setPageSize: (state, action) => {
      state.pageSize = action.payload;
    },
    setPage: (state, action) => {
      state.page = action.payload;
    },
  },
});
export const {
  setPage,
  loginSlice,
  logoutSlice,
  setPokedData,
  setPageNumber,
  setPageSize,
} = authSlice.actions;
export default authSlice.reducer;
