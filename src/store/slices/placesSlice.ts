import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Place } from '../../services/placesService';

interface PlacesState {
  recentSearches: string[];
  favoritePlaces: Place[];
  cachedPlaces: Record<string, Place>;
}

const initialState: PlacesState = {
  recentSearches: [],
  favoritePlaces: [],
  cachedPlaces: {},
};

export const placesSlice = createSlice({
  name: 'places',
  initialState,
  reducers: {
    addRecentSearch: (state, action: PayloadAction<string>) => {
      // Add to beginning of array
      state.recentSearches.unshift(action.payload);
      // Limit to 20 recent searches
      if (state.recentSearches.length > 20) {
        state.recentSearches = state.recentSearches.slice(0, 20);
      }
      // Remove duplicates using filter instead of Set to avoid downlevelIteration issue
      state.recentSearches = state.recentSearches.filter((item, index) => 
        state.recentSearches.indexOf(item) === index
      );
    },
    addFavoritePlace: (state, action: PayloadAction<Place>) => {
      state.favoritePlaces.push(action.payload);
    },
    removeFavoritePlace: (state, action: PayloadAction<string>) => {
      state.favoritePlaces = state.favoritePlaces.filter(
        place => place.place_id !== action.payload
      );
    },
    cachePlace: (state, action: PayloadAction<Place>) => {
      state.cachedPlaces[action.payload.place_id] = action.payload;
    },
    clearRecentSearches: (state) => {
      state.recentSearches = [];
    },
  },
});

export const {
  addRecentSearch,
  addFavoritePlace,
  removeFavoritePlace,
  cachePlace,
  clearRecentSearches,
} = placesSlice.actions;

export default placesSlice.reducer;