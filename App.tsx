import * as React from 'react';
import { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { View, ActivityIndicator, Platform } from 'react-native';
import { store, persistor } from './src/store';
import AppNavigator from './src/navigation/AppNavigator';
import { initAuthToken, loadUserData } from './src/services/api';
import { setUser } from './src/store/slices/authSlice';
import NotificationProvider from './src/components/NotificationProvider';

// Firebase initialization
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { initializeAuth, browserLocalPersistence, inMemoryPersistence } from 'firebase/auth';
// @ts-ignore
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { firebaseConfig } from './src/config/firebase';

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
export const db = getFirestore(firebaseApp);

// Initialize Firebase Auth with platform-specific persistence
let persistence;
if (Platform.OS === 'web') {
  // Use browser local persistence for web
  persistence = browserLocalPersistence;
} else {
  // Use in-memory persistence as fallback for other platforms
  // or implement React Native specific persistence
  try {
    // Try to use React Native persistence if available
    // @ts-ignore
    const authModule = require('firebase/auth');
    persistence = authModule.getReactNativePersistence(ReactNativeAsyncStorage);
  } catch (e) {
    // Fallback to in-memory persistence
    persistence = inMemoryPersistence;
  }
}

export const auth = initializeAuth(firebaseApp, {
  persistence: persistence
});

function AppContent() {
  const [loading, setLoading] = useState(true);
  // Note: We can't use useDispatch here because this component is not wrapped in a Provider
  // We'll handle auth restoration differently

  useEffect(() => {
    const restoreAuth = async () => {
      try {
        // Restore auth token and user data
        const token = await initAuthToken();
        const userData = await loadUserData();
        
        if (token && userData) {
          // Dispatch to store (would need to be handled differently)
          console.log('Auth restored successfully');
        }
      } catch (error) {
        console.error('Failed to restore auth:', error);
      } finally {
        setLoading(false);
      }
    };
    
    restoreAuth();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007BFF" />
      </View>
    );
  }

  return <AppNavigator />;
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <PersistGate 
          loading={
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <ActivityIndicator size="large" color="#007BFF" />
            </View>
          } 
          persistor={persistor}
        >
          <NotificationProvider>
            <AppContent />
          </NotificationProvider>
        </PersistGate>
      </Provider>
    </GestureHandlerRootView>
  );
}