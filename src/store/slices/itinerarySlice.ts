import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Destination, DayItinerary } from '../../types';

interface ItineraryState {
  days: DayItinerary[];
  selectedDay: number;
  loading: boolean;
  error: string | null;
}

const initialState: ItineraryState = {
  days: [],
  selectedDay: 1,
  loading: false,
  error: null,
};

const itinerarySlice = createSlice({
  name: 'itinerary',
  initialState,
  reducers: {
    setItinerary: (state, action: PayloadAction<DayItinerary[]>) => {
      // Normalize dates from database (strings) to Date objects
      state.days = action.payload.map(day => ({
        ...day,
        date: day.date instanceof Date ? day.date : new Date(day.date),
      }));
      state.loading = false;
    },
    addDestination: (state, action: PayloadAction<{ dayNumber: number; destination: Destination }>) => {
      const day = state.days.find(d => d.dayNumber === action.payload.dayNumber);
      if (day) {
        day.destinations.push(action.payload.destination);
      }
    },
    updateDestination: (state, action: PayloadAction<Destination>) => {
      const day = state.days.find(d => d.dayNumber === action.payload.dayNumber);
      if (day) {
        const index = day.destinations.findIndex(d => d.id === action.payload.id);
        if (index !== -1) {
          day.destinations[index] = action.payload;
        }
      }
    },
    deleteDestination: (state, action: PayloadAction<{ dayNumber: number; destinationId: string }>) => {
      const day = state.days.find(d => d.dayNumber === action.payload.dayNumber);
      if (day) {
        day.destinations = day.destinations.filter(d => d.id !== action.payload.destinationId);
      }
    },
    reorderDestinations: (state, action: PayloadAction<{ dayNumber: number; destinations: Destination[] }>) => {
      const day = state.days.find(d => d.dayNumber === action.payload.dayNumber);
      if (day) {
        // Update order property for each destination
        day.destinations = action.payload.destinations.map((dest, index) => ({
          ...dest,
          order: index,
        }));
      }
    },
    setSelectedDay: (state, action: PayloadAction<number>) => {
      state.selectedDay = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },
    setDayDestinations: (
      state,
      action: PayloadAction<{ dayNumber: number; destinations: Destination[] }>
    ) => {
      const day = state.days.find((d) => d.dayNumber === action.payload.dayNumber);
      if (day) {
        day.destinations = action.payload.destinations.map((dest, index) => ({
          ...dest,
          order: index,
        }));
      }
    },
    addDay: (state, action: PayloadAction<DayItinerary>) => {
      state.days.push(action.payload);
      state.days.sort((a, b) => a.dayNumber - b.dayNumber);
    },
    removeDay: (state, action: PayloadAction<number>) => {
      state.days = state.days.filter(d => d.dayNumber !== action.payload);
      // Re-number remaining days
      state.days.forEach((day, index) => {
        day.dayNumber = index + 1;
      });
      if (state.selectedDay > state.days.length) {
        state.selectedDay = state.days.length || 1;
      }
    },
  },
});

export const {
  setItinerary,
  addDestination,
  updateDestination,
  deleteDestination,
  reorderDestinations,
  setSelectedDay,
  setLoading,
  setError,
  setDayDestinations,
  addDay,
  removeDay,
} = itinerarySlice.actions;

export default itinerarySlice.reducer;
