import React, { useEffect, useState } from 'react';
import { Provider, useDispatch } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { View, ActivityIndicator } from 'react-native';
import { store, persistor } from './src/store';
import AppNavigator from './src/navigation/AppNavigator';
import { initAuthToken, loadUserData } from './src/services/api';
import { setUser } from './src/store/slices/authSlice';

function AppContent() {
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();

  useEffect(() => {
    const restoreAuth = async () => {
      try {
        // Restore auth token and user data
        const token = await initAuthToken();
        const userData = await loadUserData();
        
        if (token && userData) {
          dispatch(setUser(userData));
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
          <AppContent />
        </PersistGate>
      </Provider>
    </GestureHandlerRootView>
  );
}
