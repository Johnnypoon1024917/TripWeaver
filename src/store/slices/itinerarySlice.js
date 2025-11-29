import { createSlice  from '@reduxjs/toolkit';
const initialState = {
    days: [],
    selectedDay: 1,
    loading: false,
    error: null,
;
const itinerarySlice = createSlice({
    name: 'itinerary',
    initialState,
    reducers: {
        setItinerary: (state, action) => {
            // Normalize dates from database (strings) to Date objects
            state.days = action.payload.map(day => ({
                ...day,
                date: day.date instanceof Date ? day.date : new Date(day.date),
            ));
            state.loading = false;
        ,
        addDestination: (state, action) => {
            const day = state.days.find(d => d.dayNumber === action.payload.dayNumber);
            if (day) {
                day.destinations.push(action.payload.destination);
            
        ,
        updateDestination: (state, action) => {
            const day = state.days.find(d => d.dayNumber === action.payload.dayNumber);
            if (day) {
                const index = day.destinations.findIndex(d => d.id === action.payload.id);
                if (index !== -1) {
                    day.destinations[index] = action.payload;
                
            
        ,
        deleteDestination: (state, action) => {
            const day = state.days.find(d => d.dayNumber === action.payload.dayNumber);
            if (day) {
                day.destinations = day.destinations.filter(d => d.id !== action.payload.destinationId);
            
        ,
        reorderDestinations: (state, action) => {
            const day = state.days.find(d => d.dayNumber === action.payload.dayNumber);
            if (day) {
                // Update order property for each destination
                day.destinations = action.payload.destinations.map((dest, index) => ({
                    ...dest,
                    order: index,
                ));
            
        ,
        setSelectedDay: (state, action) => {
            state.selectedDay = action.payload;
        ,
        setLoading: (state, action) => {
            state.loading = action.payload;
        ,
        setError: (state, action) => {
            state.error = action.payload;
            state.loading = false;
        ,
        setDayDestinations: (state, action) => {
            const day = state.days.find((d) => d.dayNumber === action.payload.dayNumber);
            if (day) {
                day.destinations = action.payload.destinations.map((dest, index) => ({
                    ...dest,
                    order: index,
                ));
            
        ,
        addDay: (state, action) => {
            state.days.push(action.payload);
            state.days.sort((a, b) => a.dayNumber - b.dayNumber);
        ,
        updateDay: (state, action) => {
            const dayIndex = state.days.findIndex(d => `day${d.dayNumber` === action.payload.id);
            if (dayIndex !== -1) {
                // For now, we'll just update the date to be the title for display purposes
                // In a real app, you might want a separate title property
                state.days[dayIndex].date = new Date(action.payload.title);
            
        ,
        deleteDay: (state, action) => {
            const dayNumber = parseInt(action.payload.replace('day', ''), 10);
            state.days = state.days.filter(d => d.dayNumber !== dayNumber);
            // Re-number remaining days
            state.days.forEach((day, index) => {
                day.dayNumber = index + 1;
            );
            if (state.selectedDay > state.days.length) {
                state.selectedDay = state.days.length || 1;
            
        ,
        removeDay: (state, action) => {
            state.days = state.days.filter(d => d.dayNumber !== action.payload);
            // Re-number remaining days
            state.days.forEach((day, index) => {
                day.dayNumber = index + 1;
            );
            if (state.selectedDay > state.days.length) {
                state.selectedDay = state.days.length || 1;
            
        ,
    ,
);
export const { setItinerary, addDestination, updateDestination, deleteDestination, reorderDestinations, setSelectedDay, setLoading, setError, setDayDestinations, addDay, updateDay, deleteDay, removeDay,  = itinerarySlice.actions;
export default itinerarySlice.reducer;
