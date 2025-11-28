import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { store } from '../../../store';
import HomeScreen from '../../../screens/HomeScreen';
import { SELECTORS } from '../config';
// Mock the navigation
const mockNavigation = {
    navigate: jest.fn(),
    goBack: jest.fn(),
};
// Mock Redux store with initial state
const mockStore = {
    trips: {
        trips: [
            {
                id: 'trip-1',
                name: 'Trip to Paris',
                destination: 'Paris, France',
                startDate: new Date('2023-06-01'),
                endDate: new Date('2023-06-07'),
                imageUrl: 'https://example.com/paris.jpg',
                collaborators: [],
            },
            {
                id: 'trip-2',
                name: 'Trip to Tokyo',
                destination: 'Tokyo, Japan',
                startDate: new Date('2023-07-15'),
                endDate: new Date('2023-07-25'),
                imageUrl: 'https://example.com/tokyo.jpg',
                collaborators: ['user-2', 'user-3'],
            },
        ],
        loading: false,
        error: null,
    },
    auth: {
        isAuthenticated: true,
        user: {
            id: 'user-1',
            email: 'test@example.com',
            displayName: 'Test User',
        },
        loading: false,
    },
};
// Mock useSelector to return our mock store state
jest.mock('react-redux', () => ({
    ...jest.requireActual('react-redux'),
    useSelector: jest.fn().mockImplementation(selector => selector(mockStore)),
    useDispatch: () => jest.fn(),
}));
describe('HomeScreen UI Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    it('should render home screen with trip list', () => {
        const { getByText, getAllByTestId } = render(<Provider store={store}>
        <HomeScreen navigation={mockNavigation}/>
      </Provider>);
        // Check if header is present
        expect(getByText('✈️ TripWeaver')).toBeTruthy();
        // Check if create trip button is present
        expect(getByText('Create New Trip')).toBeTruthy();
        // Check if trip list items are rendered
        const tripItems = getAllByTestId(SELECTORS.TRIP_LIST_ITEM);
        expect(tripItems).toHaveLength(2);
        // Check if trip details are displayed correctly
        expect(getByText('Trip to Paris')).toBeTruthy();
        expect(getByText('Trip to Tokyo')).toBeTruthy();
    });
    it('should navigate to create trip screen when create button is pressed', () => {
        const { getByText } = render(<Provider store={store}>
        <HomeScreen navigation={mockNavigation}/>
      </Provider>);
        const createButton = getByText('Create New Trip');
        fireEvent.press(createButton);
        expect(mockNavigation.navigate).toHaveBeenCalledWith('CreateTrip');
    });
    it('should navigate to trip detail screen when a trip is selected', () => {
        const { getAllByTestId } = render(<Provider store={store}>
        <HomeScreen navigation={mockNavigation}/>
      </Provider>);
        const tripItems = getAllByTestId(SELECTORS.TRIP_LIST_ITEM);
        fireEvent.press(tripItems[0]);
        expect(mockNavigation.navigate).toHaveBeenCalledWith('TripDetail', {
            tripId: 'trip-1',
        });
    });
    it('should display correct trip information', () => {
        const { getByText } = render(<Provider store={store}>
        <HomeScreen navigation={mockNavigation}/>
      </Provider>);
        // Check Paris trip details
        expect(getByText('Trip to Paris')).toBeTruthy();
        expect(getByText('Jun 1 - Jun 7')).toBeTruthy();
        expect(getByText('0 days')).toBeTruthy(); // No collaborators
        // Check Tokyo trip details
        expect(getByText('Trip to Tokyo')).toBeTruthy();
        expect(getByText('Jul 15 - Jul 25')).toBeTruthy();
        expect(getByText('2 collaborators')).toBeTruthy();
    });
    it('should show empty state when no trips exist', () => {
        // Mock empty trips state
        const emptyStore = {
            ...mockStore,
            trips: {
                ...mockStore.trips,
                trips: [],
            },
        };
        jest.mock('react-redux', () => ({
            ...jest.requireActual('react-redux'),
            useSelector: jest.fn().mockImplementation(selector => selector(emptyStore)),
        }));
        const { getByText } = render(<Provider store={store}>
        <HomeScreen navigation={mockNavigation}/>
      </Provider>);
        expect(getByText('No trips yet')).toBeTruthy();
        expect(getByText('Create your first trip to get started')).toBeTruthy();
    });
});
