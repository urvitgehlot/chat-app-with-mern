import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import * as authAPI from "./authAPI";

const initialState = {
    status: JSON.parse(localStorage.getItem("authStatus")) || false,
    userData: JSON.parse(localStorage.getItem("userData")) || null,
    loading: false,
    error: null,
}

export const loginAsync = createAsyncThunk("auth/login", async (credentials, { rejectWithValue }) => {
    try {
        const response = await authAPI.loginUser(credentials);
        return response;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || "login failed");
    }
})

export const registerAsync = createAsyncThunk("auth/register", async (credentials, { rejectWithValue }) => {
    try {
        const response = await authAPI.registerUser(credentials);
        return response;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || "register failed");
    }
})

export const logoutAsync = createAsyncThunk("auth/logout", async (_, { rejectWithValue }) => {
    try {
        const response = await authAPI.logoutUser();
        return response;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || "logout failed");
    }
})

export const refreshTokenAsync = createAsyncThunk("auth/refresh-token", async (_, { dispatch, rejectWithValue }) => {
    try {
        const response = await authAPI.refreshAccessToken();
        return response;
    } catch (error) {
        // Refresh token is expired/invalid — force a full logout
        dispatch(logoutAsync());
        return rejectWithValue(error.response?.data?.message || "refresh token failed");
    }
})

export const checkAuthAsync = createAsyncThunk("auth/checkAuth", async (_, { rejectWithValue }) => {
    try {
        const response = await authAPI.getCurrentUser();
        return response;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || "check auth failed");
    }
})

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            // Login Cases
            .addCase(loginAsync.pending, (state) => {
                state.loading = true;
                state.error = null;
                // state.userData.
            })
            .addCase(loginAsync.fulfilled, (state, action) => {
                state.loading = false;
                state.status = true;
                state.userData = action.payload.data.user;

                localStorage.setItem('authStatus', JSON.stringify(true));
                localStorage.setItem('userData', JSON.stringify(action.payload.data.user));
            })
            .addCase(loginAsync.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Register Cases
            .addCase(registerAsync.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(registerAsync.fulfilled, (state, action) => {
                state.loading = false;
                state.status = true;
                state.userData = action.payload.data.user;

                localStorage.setItem('authStatus', JSON.stringify(true));
                localStorage.setItem('userData', JSON.stringify(action.payload.data.user));
            })
            .addCase(registerAsync.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // LogoutUser Case
            .addCase(logoutAsync.pending, (state, action) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(logoutAsync.fulfilled, (state, action) => {
                state.loading = false;
                state.status = false;
                state.userData = null;
                state.error = null;

                localStorage.removeItem('authStatus');
                localStorage.removeItem('userData');
            })
            .addCase(logoutAsync.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                state.status = false;
                state.userData = null;

                localStorage.removeItem('authStatus');
                localStorage.removeItem('userData');
            })
            // CheckAuth Case
            .addCase(checkAuthAsync.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(checkAuthAsync.fulfilled, (state, action) => {
                state.loading = false;
                state.status = true;
                state.userData = action.payload.data.user;

                localStorage.setItem('authStatus', JSON.stringify(true));
                localStorage.setItem('userData', JSON.stringify(action.payload.data.user));
            })
            .addCase(checkAuthAsync.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                state.status = false;
                state.userData = null;

                localStorage.removeItem('authStatus');
                localStorage.removeItem('userData');
            })
            // refresh access token
            .addCase(refreshTokenAsync.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(refreshTokenAsync.fulfilled, (state, action) => {
                state.loading = false;
                state.status = true;
                state.userData = action.payload.data.user;

                localStorage.setItem('authStatus', JSON.stringify(true));
                localStorage.setItem('userData', JSON.stringify(action.payload.data.user));
            })
            .addCase(refreshTokenAsync.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                state.status = false;
                state.userData = null;

                localStorage.removeItem('authStatus');
                localStorage.removeItem('userData');
            })
    }
})

export default authSlice.reducer;