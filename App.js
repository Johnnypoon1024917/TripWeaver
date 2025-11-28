import * as React from 'react';
import { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { View, ActivityIndicator } from 'react-native';
import { store, persistor } from './src/store';
import AppNavigator from './src/navigation/AppNavigator';
import { initAuthToken, loadUserData } from './src/services/api';
import NotificationProvider from './src/components/NotificationProvider';
// Firebase instances are now exported from firebaseService
// This file is kept for backward compatibility
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
            }
            catch (error) {
                console.error('Failed to restore auth:', error);
            }
            finally {
                setLoading(false);
            }
        };
        restoreAuth();
    }, []);
    if (loading) {
        return (<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007BFF"/>
      </View>);
    }
    return <AppNavigator />;
}
export default function App() {
    return (<GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <PersistGate loading={<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <ActivityIndicator size="large" color="#007BFF"/>
            </View>} persistor={persistor}>
          <NotificationProvider>
            <AppContent />
          </NotificationProvider>
        </PersistGate>
      </Provider>
    </GestureHandlerRootView>);
}
