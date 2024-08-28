import { configureStore } from "@reduxjs/toolkit";
import { indexApi } from "../features/api/indexApi";
import authSlice from "../features/slice/authSlice";
import miscSlice from "../features/slice/miscSlice";

export default configureStore({
  reducer: {
    [indexApi.reducerPath]: indexApi.reducer,

    auth: authSlice,
    misc: miscSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat([indexApi.middleware]),
});
