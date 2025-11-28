import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { store } from '../../../store';
import ProfileScreen from '../../../screens/ProfileScreen';
import { TEST_CONSTANTS } from '../config';

// Mock Redux store with initial state
const mockStore = {
  auth: {
    isAuthenticated: true,
    user: {
      id: 'user-1',
      email: TEST_CONSTANTS.TEST_USER.email,
      displayName: TEST_CONSTANTS.TEST_USER.displayName,
      photoURL: 'https://example.com/avatar.jpg',
    },
    loading: false,
    isGuest: false,
  },
  trips: {
    items: [
      TEST_CONSTANTS.TEST_TRIP,
      {
        id: 'trip-2',
        name: 'Trip to Tokyo',
        destination: 'Tokyo, Japan',
        startDate: new Date('2023-07-15'),
        endDate: new Date('2023-07-25'),
        imageUrl: 'https://example.com/tokyo.jpg',
        collaborators: [],
      },
    ],
    loading: false,
    error: null,
  },
};

// Mock guest user state
const guestStore = {
  auth: {
    isAuthenticated: true,
    user: {
      id: 'user-1',
      email: TEST_CONSTANTS.TEST_USER.email,
      displayName: TEST_CONSTANTS.TEST_USER.displayName,
      photoURL: 'https://example.com/avatar.jpg',
    },
    loading: false,
    isGuest: true,
  },
  trips: {
    items: [
      TEST_CONSTANTS.TEST_TRIP,
      {
        id: 'trip-2',
        name: 'Trip to Tokyo',
        destination: 'Tokyo, Japan',
        startDate: new Date('2023-07-15'),
        endDate: new Date('2023-07-25'),
        imageUrl: 'https://example.com/tokyo.jpg',
        collaborators: [],
      },
    ],
    loading: false,
    error: null,
  },
};

// Mock useSelector to return our mock store state
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: jest.fn().mockImplementation((selector: any) => {
    // We'll set the store state in each test
    return selector(mockStore);
  }),
  useDispatch: () => jest.fn(),
}));

// Mock navigation
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    setOptions: jest.fn(),
  }),
}));

// Mock auth functions
jest.mock('../../../utils/auth', () => ({
  signOut: jest.fn(),
}));

describe('ProfileScreen UI Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset useSelector mock to use default store
    const { useSelector } = require('react-redux');
    useSelector.mockImplementation((selector: any) => selector(mockStore));
  });

  it('should render profile screen with user information', () => {
    const { getByText, getByTestId } = render(
      <Provider store={store}>
        <ProfileScreen />
      </Provider>
    );

    // Check if user information is displayed
    expect(getByText(TEST_CONSTANTS.TEST_USER.displayName)).toBeTruthy();
    expect(getByText(TEST_CONSTANTS.TEST_USER.email)).toBeTruthy();
    
    // Check if profile picture is present
    expect(getByTestId('profile-avatar')).toBeTruthy();
    
    // Check if trip statistics are displayed
    expect(getByText('2')).toBeTruthy(); // Number of trips
    expect(getByText('0')).toBeTruthy(); // Number of collaborators
  });

  it('should display correct user statistics', () => {
    const { getByText } = render(
      <Provider store={store}>
        <ProfileScreen />
      </Provider>
    );

    // Check trip statistics
    expect(getByText('Total Trips')).toBeTruthy();
    expect(getByText('2')).toBeTruthy();
    
    expect(getByText('Collaborators')).toBeTruthy();
    expect(getByText('0')).toBeTruthy();
    
    expect(getByText('Destinations')).toBeTruthy();
    expect(getByText('0')).toBeTruthy(); // Would need to calculate from itinerary
    
    // Check account information
    expect(getByText('Account Information')).toBeTruthy();
    expect(getByText(TEST_CONSTANTS.TEST_USER.email)).toBeTruthy();
  });

  it('should allow user to navigate to settings', () => {
    const { getByText } = render(
      <Provider store={store}>
        <ProfileScreen />
      </Provider>
    );

    const settingsButton = getByText('Settings');
    fireEvent.press(settingsButton);
    
    // TODO: Add actual navigation verification when we can mock the settings screen
  });

  it('should allow user to sign out', async () => {
    const { getByText } = render(
      <Provider store={store}>
        <ProfileScreen />
      </Provider>
    );

    const signOutButton = getByText('Sign Out');
    fireEvent.press(signOutButton);
    
    // Wait for confirmation dialog
    await waitFor(() => {
      // TODO: Add actual sign out flow verification when we can mock the Alert component
    });
  });

  it('should display guest mode indicator for guest users', () => {
    // Change mock store to guest store
    const { useSelector } = require('react-redux');
    useSelector.mockImplementation((selector: any) => selector(guestStore));
    
    const { getByText } = render(
      <Provider store={store}>
        <ProfileScreen />
      </Provider>
    );

    expect(getByText('Guest Mode')).toBeTruthy();
    expect(getByText('Sign in to save your trips')).toBeTruthy();
  });
});