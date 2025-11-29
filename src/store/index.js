import { configureStore  from '@reduxjs/toolkit';
import { persistStore, persistReducer  from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { combineReducers  from 'redux';
import authReducer from './slices/authSlice';
import tripsReducer from './slices/tripsSlice';
import itineraryReducer from './slices/itinerarySlice';
import budgetReducer from './slices/budgetSlice';
import settingsReducer from './slices/settingsSlice';
import packingReducer from './slices/packingSlice';
import placesReducer from './slices/placesSlice';
import collaborationReducer from './slices/collaborationSlice';
import tripSyncReducer from './slices/tripSyncSlice';
import notificationsReducer from './slices/notificationsSlice';
const persistConfig = {
    key: 'root',
    storage: AsyncStorage,
    whitelist: ['auth', 'trips', 'itinerary', 'packing', 'places', 'collaboration', 'tripSync', 'notifications'], // Only persist these reducers
    timeout: 10000, // 10 seconds timeout
;
const rootReducer = combineReducers({
    auth: authReducer,
    trips: tripsReducer,
    itinerary: itineraryReducer,
    budget: budgetReducer,
    settings: settingsReducer,
    packing: packingReducer,
    places: placesReducer,
    collaboration: collaborationReducer,
    tripSync: tripSyncReducer,
    notifications: notificationsReducer,
);
const persistedReducer = persistReducer(persistConfig, rootReducer);
export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({
        serializableCheck: {
            ignoredActions: [
                'persist/PERSIST',
                'persist/REHYDRATE',
                'trips/addTrip',
                'trips/updateTrip'
            ],
            ignoredPaths: ['trips.items'],
        ,
    ),
);
export const persistor = persistStore(store);
