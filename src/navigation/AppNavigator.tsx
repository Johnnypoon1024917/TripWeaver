import React from 'react';
import { Text as RNText, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

// Import screens
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import TripDetailScreen from '../screens/TripDetailScreen';
import ItineraryScreen from '../screens/ItineraryScreen';
import MapScreen from '../screens/MapScreen';
import MapboxMapScreen from '../screens/MapboxMapScreen';
import BudgetScreen from '../screens/BudgetScreen';
import EnhancedBudgetScreen from '../screens/EnhancedBudgetScreen';
import ProfileScreen from '../screens/ProfileScreen';
import CreateTripScreen from '../screens/CreateTripScreen';
import AddDestinationScreen from '../screens/AddDestinationScreen';
import CollaboratorsScreen from '../screens/CollaboratorsScreen';
import ExploreScreen from '../screens/ExploreScreen';
import DiscoveryScreen from '../screens/DiscoveryScreen';
import TravelJournalScreen from '../screens/TravelJournalScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import NotificationBadge from '../components/NotificationBadge';
import NotificationSettingsScreen from '../screens/NotificationSettingsScreen';
import NotificationTestScreen from '../screens/NotificationTestScreen';

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  MainTabs: undefined;
  TripDetail: { tripId: string };
  CreateTrip: undefined;
  AddDestination: { tripId: string; dayNumber: number };
  Collaborators: { tripId: string };
  Explore: undefined;
  NotificationSettings: undefined;
  NotificationTest: undefined;
};

export type TabParamList = {
  Home: undefined;
  Itinerary: undefined;
  Journal: undefined;
  Map: undefined;
  Budget: undefined;
  Discovery: undefined;
  Notifications: undefined;
  Profile: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#8E8E93',
        headerShown: false,
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{ 
          tabBarLabel: 'Trips',
          tabBarIcon: ({ color }) => <RNText style={{ fontSize: 20 }}>🏠</RNText>,
        }}
      />
      <Tab.Screen 
        name="Itinerary" 
        component={ItineraryScreen}
        options={{ 
          tabBarLabel: 'Itinerary',
          tabBarIcon: ({ color }) => <RNText style={{ fontSize: 20 }}>📋</RNText>,
        }}
      />
      <Tab.Screen 
        name="Journal" 
        component={TravelJournalScreen}
        options={{ 
          tabBarLabel: 'Journal',
          tabBarIcon: ({ color }) => <RNText style={{ fontSize: 20 }}>📝</RNText>,
        }}
      />
      <Tab.Screen 
        name="Map" 
        component={MapboxMapScreen}
        options={{ 
          tabBarLabel: 'Map',
          tabBarIcon: ({ color }) => <RNText style={{ fontSize: 20 }}>🗺️</RNText>,
        }}
      />
      <Tab.Screen 
        name="Budget" 
        component={EnhancedBudgetScreen}
        options={{ 
          tabBarLabel: 'Budget',
          tabBarIcon: ({ color }) => <RNText style={{ fontSize: 20 }}>💰</RNText>,
        }}
      />
      <Tab.Screen 
        name="Discovery" 
        component={DiscoveryScreen}
        options={{ 
          tabBarLabel: 'Discover',
          tabBarIcon: ({ color }) => <RNText style={{ fontSize: 20 }}>🌟</RNText>,
        }}
      />
      <Tab.Screen 
        name="Notifications" 
        component={NotificationsScreen}
        options={{ 
          tabBarLabel: 'Notifications',
          tabBarIcon: ({ color }) => (
            <View>
              <RNText style={{ fontSize: 20 }}>🔔</RNText>
              <NotificationBadge />
            </View>
          ),
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ 
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color }) => <RNText style={{ fontSize: 20 }}>👤</RNText>,
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="MainTabs" component={TabNavigator} />
            <Stack.Screen 
              name="TripDetail" 
              component={TripDetailScreen}
              options={{ headerShown: true, title: 'Trip Details' }}
            />
            <Stack.Screen 
              name="CreateTrip" 
              component={CreateTripScreen}
              options={{ headerShown: true, title: 'Create Trip' }}
            />
            <Stack.Screen 
              name="AddDestination" 
              component={AddDestinationScreen}
              options={{ headerShown: true, title: 'Add Destination' }}
            />
            <Stack.Screen 
              name="Collaborators" 
              component={CollaboratorsScreen}
              options={{ headerShown: true, title: 'Manage Collaborators' }}
            />
            <Stack.Screen 
              name="Explore" 
              component={ExploreScreen}
              options={{ headerShown: true, title: 'Explore Places' }}
            />
            <Stack.Screen 
              name="NotificationSettings" 
              component={NotificationSettingsScreen}
              options={{ headerShown: true, title: 'Notification Settings' }}
            />
            <Stack.Screen 
              name="NotificationTest" 
              component={NotificationTestScreen}
              options={{ headerShown: true, title: 'Notification Test' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
