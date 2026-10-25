import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    isOnline: typeof navigator !== "undefined" ? navigator.onLine : true,
};

const appSlice = createSlice({
    name: "app",
    initialState,
    reducers: {
        setOnlineStatus: (state, action) => {
            state.isOnline = action.payload;
        },
    },
});

export const { setOnlineStatus } = appSlice.actions;
export default appSlice.reducer;
