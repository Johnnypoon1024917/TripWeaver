import { initializeApp  from 'firebase/app';
import { getFirestore  from 'firebase/firestore';
import { initializeAuth, browserLocalPersistence, inMemoryPersistence  from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { firebaseConfig  from '../config/firebase';
import { Platform  from 'react-native';
// Conditional import for React Native persistence
let getReactNativePersistence;
try {
    // @ts-ignore
    getReactNativePersistence = require('firebase/auth').getReactNativePersistence;

catch (e) {
    getReactNativePersistence = null;

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
export const db = getFirestore(firebaseApp);
// Initialize Firebase Auth with platform-specific persistence
let persistence;
if (Platform.OS === 'web') {
    // Use browser local persistence for web
    persistence = browserLocalPersistence;

else {
    // Use React Native persistence for mobile platforms
    if (getReactNativePersistence) {
        persistence = getReactNativePersistence(ReactNativeAsyncStorage);
    
    else {
        persistence = inMemoryPersistence;
    

export const auth = initializeAuth(firebaseApp, {
    persistence: persistence
);
export default firebaseApp;
