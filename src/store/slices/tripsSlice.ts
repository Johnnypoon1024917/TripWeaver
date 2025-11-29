import { createSlice, PayloadAction  from '@reduxjs/toolkit';
import { Trip  from '../../types';

interface TripsState {
  items: Trip[];
  selectedTrip: Trip | null;
  loading: boolean;
  error: string | null;


const initialState: TripsState = {
  items: [],
  selectedTrip: null,
  loading: false,
  error: null,
;

const tripsSlice = createSlice({
  name: 'trips',
  initialState,
  reducers: {
    setTrips: (state, action: PayloadAction<Trip[]>) => {
      // Normalize dates from database (strings) to Date objects
      state.items = action.payload.map(trip => ({
        ...trip,
        startDate: trip.startDate instanceof Date ? trip.startDate : new Date(trip.startDate),
        endDate: trip.endDate instanceof Date ? trip.endDate : new Date(trip.endDate),
        createdAt: trip.createdAt instanceof Date ? trip.createdAt : new Date(trip.createdAt),
        updatedAt: trip.updatedAt instanceof Date ? trip.updatedAt : new Date(trip.updatedAt),
      ));
      state.loading = false;
    ,
    addTrip: (state, action: PayloadAction<Trip>) => {
      state.items.push(action.payload);
    ,
    updateTrip: (state, action: PayloadAction<Trip>) => {
      const index = state.items.findIndex(t => t.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = action.payload;
      
      if (state.selectedTrip?.id === action.payload.id) {
        state.selectedTrip = action.payload;
      
    ,
    deleteTrip: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(t => t.id !== action.payload);
      if (state.selectedTrip?.id === action.payload) {
        state.selectedTrip = null;
      
    ,
    selectTrip: (state, action: PayloadAction<Trip>) => {
      // Normalize dates from database
      state.selectedTrip = {
        ...action.payload,
        startDate: action.payload.startDate instanceof Date ? action.payload.startDate : new Date(action.payload.startDate),
        endDate: action.payload.endDate instanceof Date ? action.payload.endDate : new Date(action.payload.endDate),
        createdAt: action.payload.createdAt instanceof Date ? action.payload.createdAt : new Date(action.payload.createdAt),
        updatedAt: action.payload.updatedAt instanceof Date ? action.payload.updatedAt : new Date(action.payload.updatedAt),
      ;
    ,
    clearSelectedTrip: (state) => {
      state.selectedTrip = null;
    ,
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    ,
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    ,
    addCollaborator: (
      state,
      action: PayloadAction<{ tripId: string; collaboratorEmail: string; role: 'editor' | 'viewer' >
    ) => {
      const trip = state.items.find((t) => t.id === action.payload.tripId);
      if (trip && !trip.collaborators.includes(action.payload.collaboratorEmail)) {
        trip.collaborators.push(action.payload.collaboratorEmail);
      
      if (state.selectedTrip?.id === action.payload.tripId) {
        state.selectedTrip = trip || null;
      
    ,
    removeCollaborator: (
      state,
      action: PayloadAction<{ tripId: string; userId: string >
    ) => {
      const trip = state.items.find((t) => t.id === action.payload.tripId);
      if (trip) {
        trip.collaborators = trip.collaborators.filter((c) => !c.includes(action.payload.userId));
      
      if (state.selectedTrip?.id === action.payload.tripId) {
        state.selectedTrip = trip || null;
      
    ,
  ,
);

export const {
  setTrips,
  addTrip,
  updateTrip,
  deleteTrip,
  selectTrip,
  clearSelectedTrip,
  setLoading,
  setError,
  addCollaborator,
  removeCollaborator,
 = tripsSlice.actions;

export default tripsSlice.reducer;
