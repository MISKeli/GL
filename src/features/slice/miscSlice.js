import { createSlice } from "@reduxjs/toolkit";
const initialState = {
  sidebar: false,
  folderApiUrl: "",
  
};
const miscSlice = createSlice({
  name: "misc",
  initialState,

  reducers: {
    triggerSidebar: (state, action) => {
      state.sidebar = action.payload.sidebar;
    },
    setFolderUrl: (state, action) => {
      state.folderApiUrl = action.payload;
    },
  },
});
export const { triggerSidebar, setFolderUrl } = miscSlice.actions;
export default miscSlice.reducer;
