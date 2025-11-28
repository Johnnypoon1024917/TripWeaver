import { createSlice } from '@reduxjs/toolkit';
const initialState = {
    user: null,
    isAuthenticated: false,
    isGuest: false,
    loading: false,
    error: null,
};
const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setUser: (state, action) => {
            state.user = action.payload;
            state.isAuthenticated = true;
            state.isGuest = false;
            state.loading = false;
            state.error = null;
        },
        setGuestMode: (state) => {
            state.user = {
                id: 'guest_' + Date.now(),
                email: 'guest@tripweaver.app',
                displayName: 'Guest User',
                createdAt: new Date(),
            };
            state.isAuthenticated = true;
            state.isGuest = true;
            state.loading = false;
            state.error = null;
        },
        clearUser: (state) => {
            state.user = null;
            state.isAuthenticated = false;
            state.isGuest = false;
            state.loading = false;
            state.error = null;
        },
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
        setError: (state, action) => {
            state.error = action.payload;
            state.loading = false;
        },
    },
});
export const { setUser, setGuestMode, clearUser, setLoading, setError } = authSlice.actions;
export default authSlice.reducer;
