import { createSlice, PayloadAction  from '@reduxjs/toolkit';
import { User  from '../../types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isGuest: boolean;
  loading: boolean;
  error: string | null;


const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isGuest: false,
  loading: false,
  error: null,
;

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.isGuest = false;
      state.loading = false;
      state.error = null;
    ,
    setGuestMode: (state) => {
      state.user = {
        id: 'guest_' + Date.now(),
        email: 'guest@tripweaver.app',
        displayName: 'Guest User',
        createdAt: new Date(),
      ;
      state.isAuthenticated = true;
      state.isGuest = true;
      state.loading = false;
      state.error = null;
    ,
    clearUser: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.isGuest = false;
      state.loading = false;
      state.error = null;
    ,
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    ,
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    ,
  ,
);

export const { setUser, setGuestMode, clearUser, setLoading, setError  = authSlice.actions;
export default authSlice.reducer;
