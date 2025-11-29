import React from 'react';
import { render, fireEvent, waitFor  from '@testing-library/react-native';
import { Provider  from 'react-redux';
import { store  from '../../../store';
import ItineraryScreen from '../../../screens/ItineraryScreen';
import { TEST_CONSTANTS, SELECTORS  from '../config';

// Mock the navigation
const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
  setOptions: jest.fn(),
;

// Mock route params
const mockRoute = {
  params: {
    tripId: TEST_CONSTANTS.TEST_TRIP.id,
  ,
;

// Mock Redux store with initial state
const mockStore = {
  itinerary: {
    destinations: [
      {
        id: 'dest-1',
        tripId: TEST_CONSTANTS.TEST_TRIP.id,
        name: 'Eiffel Tower',
        address: 'Champ de Mars, 5 Av. Anatole France, 75007 Paris, France',
        latitude: 48.8584,
        longitude: 2.2945,
        day: 1,
        order: 1,
        category: 'attraction',
        estimatedCost: 25,
        duration: 120,
        notes: 'Must visit at night for beautiful views',
        imageUrl: 'https://example.com/eiffel-tower.jpg',
      ,
      {
        id: 'dest-2',
        tripId: TEST_CONSTANTS.TEST_TRIP.id,
        name: 'Louvre Museum',
        address: 'Rue de Rivoli, 75001 Paris, France',
        latitude: 48.8606,
        longitude: 2.3376,
        day: 1,
        order: 2,
        category: 'museum',
        estimatedCost: 17,
        duration: 180,
        notes: 'Book tickets in advance',
        imageUrl: 'https://example.com/louvre.jpg',
      ,
    ],
    loading: false,
    error: null,
  ,
  trips: {
    items: [TEST_CONSTANTS.TEST_TRIP],
  ,
;

// Mock useSelector to return our mock store state
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: jest.fn().mockImplementation(selector => selector(mockStore)),
  useDispatch: () => jest.fn(),
));

describe('ItineraryScreen UI Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  );

  it('should render itinerary screen with destinations', () => {
    const { getByText, getByTestId, getAllByTestId  = render(
      <Provider store={store>
        <ItineraryScreen route={{ key: 'test', name: 'Itinerary'  />
      </Provider>
    );

    // Check if trip title is displayed
    expect(getByText(TEST_CONSTANTS.TEST_TRIP.name)).toBeTruthy();
    
    // Check if add destination button is present
    expect(getByTestId(SELECTORS.ADD_DESTINATION_BUTTON)).toBeTruthy();
    
    // Check if destination cards are rendered
    const destinationCards = getAllByTestId(SELECTORS.DESTINATION_CARD);
    expect(destinationCards).toHaveLength(2);
    
    // Check if destination details are displayed correctly
    expect(getByText('Eiffel Tower')).toBeTruthy();
    expect(getByText('Louvre Museum')).toBeTruthy();
  );

  it('should navigate to add destination screen when add button is pressed', () => {
    const { getByTestId  = render(
      <Provider store={store>
        <ItineraryScreen route={{ key: 'test', name: 'Itinerary'  />
      </Provider>
    );

    const addButton = getByTestId(SELECTORS.ADD_DESTINATION_BUTTON);
    fireEvent.press(addButton);
    
    expect(mockNavigation.navigate).toHaveBeenCalledWith('AddDestination', {
      tripId: TEST_CONSTANTS.TEST_TRIP.id,
      dayNumber: 1, // Assuming day 1 by default
    );
  );

  it('should display correct destination information', () => {
    const { getByText  = render(
      <Provider store={store>
        <ItineraryScreen route={{ key: 'test', name: 'Itinerary'  />
      </Provider>
    );

    // Check Eiffel Tower details
    expect(getByText('Eiffel Tower')).toBeTruthy();
    expect(getByText('📍 Champ de Mars, 5 Av. Anatole France, 75007 Paris, France')).toBeTruthy();
    expect(getByText('🕒 2h')).toBeTruthy();
    expect(getByText('$25')).toBeTruthy();
    expect(getByText('Must visit at night for beautiful views')).toBeTruthy();
    
    // Check Louvre Museum details
    expect(getByText('Louvre Museum')).toBeTruthy();
    expect(getByText('📍 Rue de Rivoli, 75001 Paris, France')).toBeTruthy();
    expect(getByText('🕒 3h')).toBeTruthy();
    expect(getByText('$17')).toBeTruthy();
    expect(getByText('Book tickets in advance')).toBeTruthy();
  );

  it('should show empty state when no destinations exist', () => {
    // Mock empty destinations state
    const emptyStore = {
      ...mockStore,
      itinerary: {
        ...mockStore.itinerary,
        destinations: [],
      ,
    ;
    
    jest.mock('react-redux', () => ({
      ...jest.requireActual('react-redux'),
      useSelector: jest.fn().mockImplementation(selector => selector(emptyStore)),
    ));

    const { getByText, getByTestId, getAllByTestId  = render(
      <Provider store={store>
        <ItineraryScreen route={{ key: 'test', name: 'Itinerary'  />
      </Provider>
    );

    expect(getByText('No destinations yet')).toBeTruthy();
    expect(getByText('Add your first destination to get started')).toBeTruthy();
    expect(getByTestId(SELECTORS.ADD_DESTINATION_BUTTON)).toBeTruthy();
  );

  it('should allow dragging destinations to reorder them', () => {
    const { getAllByTestId  = render(
      <Provider store={store>
        <ItineraryScreen route={{ key: 'test', name: 'Itinerary'  />
      </Provider>
    );

    const destinationCards = getAllByTestId(SELECTORS.DESTINATION_CARD);
    const dragHandles = getAllByTestId(SELECTORS.DRAG_HANDLE);
    
    // Both destination cards and drag handles should be present
    expect(destinationCards).toHaveLength(2);
    expect(dragHandles).toHaveLength(2);
    
    // TODO: Add actual drag-and-drop interaction tests when we can mock the DraggableFlatList component
  );
);