import { createSlice } from "@reduxjs/toolkit";
const initialState = {
  sidebar: false,
};
const miscSlice = createSlice({
  name: "misc",
  initialState,

  reducers: {
    triggerSidebar: (state, action) => {
      state.sidebar = action.payload.sidebar;
    },
  },
});
export const { triggerSidebar } = miscSlice.actions;
export default miscSlice.reducer;
