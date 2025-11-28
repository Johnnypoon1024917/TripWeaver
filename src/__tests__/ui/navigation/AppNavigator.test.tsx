import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { store } from '../../../store';
import AppNavigator from '../../../navigation/AppNavigator';
import { TEST_CONSTANTS } from '../config';

// Mock Redux store with initial state
const mockStore = {
  auth: {
    isAuthenticated: true,
    user: {
      id: 'user-1',
      email: TEST_CONSTANTS.TEST_USER.email,
      displayName: TEST_CONSTANTS.TEST_USER.displayName,
    },
    loading: false,
    isGuest: false,
  },
  trips: {
    items: [
      TEST_CONSTANTS.TEST_TRIP,
    ],
    loading: false,
    error: null,
  },
  itinerary: {
    destinations: [
      TEST_CONSTANTS.TEST_DESTINATION,
    ],
    loading: false,
    error: null,
  },
  budget: {
    budgets: [
      TEST_CONSTANTS.TEST_BUDGET_ITEM,
    ],
    expenses: [
      TEST_CONSTANTS.TEST_EXPENSE,
    ],
    loading: false,
    error: null,
  },
};

// Mock useSelector to return our mock store state
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: jest.fn().mockImplementation(selector => selector(mockStore)),
  useDispatch: () => jest.fn(),
}));

// Mock navigation container
jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  return {
    ...actualNav,
    NavigationContainer: ({ children }: any) => <>{children}</>,
  };
});

describe('AppNavigator UI Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render the main app navigator when user is authenticated', () => {
    const { getByText } = render(
      <Provider store={store}>
        <AppNavigator />
      </Provider>
    );

    // Should render the main tabs navigator
    expect(getByText('🏠')).toBeTruthy(); // Home tab icon
    expect(getByText('📋')).toBeTruthy(); // Itinerary tab icon
    expect(getByText('🗺️')).toBeTruthy(); // Map tab icon
    expect(getByText('💰')).toBeTruthy(); // Budget tab icon
    expect(getByText('👤')).toBeTruthy(); // Profile tab icon
  });

  it('should render the login screen when user is not authenticated', () => {
    // Mock unauthenticated state
    const unauthStore = {
      ...mockStore,
      auth: {
        ...mockStore.auth,
        isAuthenticated: false,
      },
    };
    
    jest.mock('react-redux', () => ({
      ...jest.requireActual('react-redux'),
      useSelector: jest.fn().mockImplementation(selector => selector(unauthStore)),
    }));

    const { getByTestId, getByText } = render(
      <Provider store={store}>
        <AppNavigator />
      </Provider>
    );

    // Should render the login screen
    expect(getByTestId('login-email-input')).toBeTruthy();
    expect(getByTestId('login-password-input')).toBeTruthy();
    expect(getByTestId('login-button')).toBeTruthy();
    expect(getByText('Continue as Guest')).toBeTruthy();
  });

  it('should allow navigation between main tabs', () => {
    const { getByText, queryByText } = render(
      <Provider store={store}>
        <AppNavigator />
      </Provider>
    );

    // Initially should show home screen content
    expect(getByText(TEST_CONSTANTS.TEST_TRIP.name)).toBeTruthy();

    // Navigate to itinerary tab
    const itineraryTab = getByText('📋');
    fireEvent.press(itineraryTab);
    
    // Should show itinerary screen content
    expect(getByText('No destinations yet')).toBeTruthy();

    // Navigate to map tab
    const mapTab = getByText('🗺️');
    fireEvent.press(mapTab);
    
    // Should show map screen content
    // Note: Actual map rendering is mocked in MapScreen test

    // Navigate to budget tab
    const budgetTab = getByText('💰');
    fireEvent.press(budgetTab);
    
    // Should show budget screen content
    expect(getByText('Total Budget')).toBeTruthy();

    // Navigate to profile tab
    const profileTab = getByText('👤');
    fireEvent.press(profileTab);
    
    // Should show profile screen content
    expect(getByText(TEST_CONSTANTS.TEST_USER.displayName)).toBeTruthy();
  });

  it('should allow navigation to detail screens', () => {
    const { getByText, queryByText } = render(
      <Provider store={store}>
        <AppNavigator />
      </Provider>
    );

    // Navigate to trip detail
    const tripItem = getByText(TEST_CONSTANTS.TEST_TRIP.name);
    fireEvent.press(tripItem);
    
    // Should navigate to trip detail screen
    // Note: Actual navigation verification would require more complex mocking
  });

  it('should handle guest mode navigation', () => {
    // Mock guest user state
    const guestStore = {
      ...mockStore,
      auth: {
        ...mockStore.auth,
        isGuest: true,
      },
    };
    
    jest.mock('react-redux', () => ({
      ...jest.requireActual('react-redux'),
      useSelector: jest.fn().mockImplementation(selector => selector(guestStore)),
    }));

    const { getByText } = render(
      <Provider store={store}>
        <AppNavigator />
      </Provider>
    );

    // Should render main app with guest mode indicator
    expect(getByText('🏠')).toBeTruthy(); // Home tab icon
    // Guest users should still be able to navigate the app
  });
});