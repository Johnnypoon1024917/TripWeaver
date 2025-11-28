import { createSlice } from '@reduxjs/toolkit';
const initialState = {
    recentSearches: [],
    favoritePlaces: [],
    cachedPlaces: {},
};
export const placesSlice = createSlice({
    name: 'places',
    initialState,
    reducers: {
        addRecentSearch: (state, action) => {
            // Add to beginning of array
            state.recentSearches.unshift(action.payload);
            // Limit to 20 recent searches
            if (state.recentSearches.length > 20) {
                state.recentSearches = state.recentSearches.slice(0, 20);
            }
            // Remove duplicates using filter instead of Set to avoid downlevelIteration issue
            state.recentSearches = state.recentSearches.filter((item, index) => state.recentSearches.indexOf(item) === index);
        },
        addFavoritePlace: (state, action) => {
            state.favoritePlaces.push(action.payload);
        },
        removeFavoritePlace: (state, action) => {
            state.favoritePlaces = state.favoritePlaces.filter(place => place.place_id !== action.payload);
        },
        cachePlace: (state, action) => {
            state.cachedPlaces[action.payload.place_id] = action.payload;
        },
        clearRecentSearches: (state) => {
            state.recentSearches = [];
        },
    },
});
export const { addRecentSearch, addFavoritePlace, removeFavoritePlace, cachePlace, clearRecentSearches, } = placesSlice.actions;
export default placesSlice.reducer;
