import { createSlice, PayloadAction  from '@reduxjs/toolkit';
import { db  from '../../services/firebaseService';
import { 
  collection, 
  doc, 
  onSnapshot, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  serverTimestamp
 from 'firebase/firestore';
import { Trip, Destination, DayItinerary  from '../../types';

interface TripSyncState {
  isSyncing: boolean;
  syncedTripId: string | null;
  lastSync: Date | null;
  hasUnsavedChanges: boolean;


const initialState: TripSyncState = {
  isSyncing: false,
  syncedTripId: null,
  lastSync: null,
  hasUnsavedChanges: false,
;

export const tripSyncSlice = createSlice({
  name: 'tripSync',
  initialState,
  reducers: {
    setSyncing: (state: TripSyncState, action: PayloadAction<boolean>) => {
      state.isSyncing = action.payload;
    ,
    setSyncedTrip: (state: TripSyncState, action: PayloadAction<string | null>) => {
      state.syncedTripId = action.payload;
    ,
    setLastSync: (state: TripSyncState, action: PayloadAction<Date | null>) => {
      state.lastSync = action.payload;
    ,
    setHasUnsavedChanges: (state: TripSyncState, action: PayloadAction<boolean>) => {
      state.hasUnsavedChanges = action.payload;
    ,
  ,
);

export const {
  setSyncing,
  setSyncedTrip,
  setLastSync,
  setHasUnsavedChanges,
 = tripSyncSlice.actions;

// Thunk to start syncing a trip
export const startTripSync = (tripId: string) => {
  return async (dispatch: any, getState: any) => {
    try {
      dispatch(setSyncing(true));
      dispatch(setSyncedTrip(tripId));
      
      // Listen for trip changes
      const tripRef = doc(db, 'trips', tripId);
      const unsubscribe = onSnapshot(tripRef, (doc: any) => {
        if (doc.exists()) {
          const tripData = doc.data() as Trip;
          // Update local trip state
          // This would dispatch actions to update the trips slice
          console.log('Trip updated:', tripData);
        
      );
      
      // Listen for itinerary changes
      const itineraryRef = collection(db, 'trips', tripId, 'itinerary');
      const itineraryUnsubscribe = onSnapshot(itineraryRef, (snapshot: any) => {
        snapshot.docChanges().forEach((change: any) => {
          if (change.type === 'added' || change.type === 'modified') {
            const dayData = change.doc.data() as DayItinerary;
            // Update local itinerary state
            console.log('Day itinerary updated:', dayData);
           else if (change.type === 'removed') {
            // Remove day from local state
            console.log('Day removed:', change.doc.id);
          
        );
      );
      
      // Clean up function
      return () => {
        unsubscribe();
        itineraryUnsubscribe();
      ;
     catch (error) {
      console.error('Error starting trip sync:', error);
      dispatch(setSyncing(false));
    
  ;
;

// Thunk to sync trip data to Firestore
export const syncTripToFirestore = (trip: Trip) => {
  return async (dispatch: any, getState: any) => {
    try {
      dispatch(setHasUnsavedChanges(false));
      
      const tripRef = doc(db, 'trips', trip.id);
      await updateDoc(tripRef, {
        ...trip,
        updatedAt: serverTimestamp(),
      );
      
      dispatch(setLastSync(new Date()));
     catch (error) {
      console.error('Error syncing trip:', error);
      dispatch(setHasUnsavedChanges(true));
    
  ;
;

// Thunk to sync itinerary data to Firestore
export const syncItineraryToFirestore = (tripId: string, dayItinerary: DayItinerary) => {
  return async (dispatch: any, getState: any) => {
    try {
      const dayRef = doc(collection(db, 'trips', tripId, 'itinerary'), dayItinerary.dayNumber.toString());
      await setDoc(dayRef, dayItinerary);
     catch (error) {
      console.error('Error syncing itinerary:', error);
    
  ;
;

export default tripSyncSlice.reducer;