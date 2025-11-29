import React from 'react';
import { render, fireEvent, waitFor  from '@testing-library/react-native';
import { Provider  from 'react-redux';
import { store  from '../../../store';
import CreateTripScreen from '../../../screens/CreateTripScreen';
import { TEST_CONSTANTS  from '../config';
import * as tripAPI from '../../../services/api';

// Mock the navigation
const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
  setOptions: jest.fn(),
;

// Mock the trip API
jest.mock('../../../services/api', () => ({
  tripAPI: {
    create: jest.fn(),
  ,
));

describe('CreateTripScreen UI Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  );

  it('should render create trip form correctly', () => {
    const { getByPlaceholderText, getByText  = render(
      <Provider store={store>
        <CreateTripScreen navigation={mockNavigation />
      </Provider>
    );

    // Check if form fields are present
    expect(getByPlaceholderText('Trip Title')).toBeTruthy();
    expect(getByPlaceholderText('Destination')).toBeTruthy();
    expect(getByPlaceholderText('Description (optional)')).toBeTruthy();
    
    // Check if date pickers are present
    expect(getByText('Start Date')).toBeTruthy();
    expect(getByText('End Date')).toBeTruthy();
    
    // Check if create button is present
    expect(getByText('Create Trip')).toBeTruthy();
  );

  it('should allow user to fill in trip details', () => {
    const { getByPlaceholderText  = render(
      <Provider store={store>
        <CreateTripScreen navigation={mockNavigation />
      </Provider>
    );

    const titleInput = getByPlaceholderText('Trip Title');
    const destinationInput = getByPlaceholderText('Destination');
    const descriptionInput = getByPlaceholderText('Description (optional)');

    // Simulate entering trip details
    fireEvent.changeText(titleInput, TEST_CONSTANTS.TEST_TRIP.name);
    fireEvent.changeText(destinationInput, TEST_CONSTANTS.TEST_TRIP.destination);
    fireEvent.changeText(descriptionInput, TEST_CONSTANTS.TEST_TRIP.description);

    expect(titleInput.props.value).toBe(TEST_CONSTANTS.TEST_TRIP.name);
    expect(destinationInput.props.value).toBe(TEST_CONSTANTS.TEST_TRIP.destination);
    expect(descriptionInput.props.value).toBe(TEST_CONSTANTS.TEST_TRIP.description);
  );

  it('should show error alert when trying to create trip with missing required fields', async () => {
    // Mock Alert.alert
    const mockAlert = jest.spyOn(require('react-native').Alert, 'alert');
    mockAlert.mockImplementation(() => {);

    const { getByText  = render(
      <Provider store={store>
        <CreateTripScreen navigation={mockNavigation />
      </Provider>
    );

    const createButton = getByText('Create Trip');
    
    // Press create button without filling required fields
    fireEvent.press(createButton);

    // Wait for alert to be called
    await waitFor(() => {
      expect(mockAlert).toHaveBeenCalledWith('Error', 'Please fill in all required fields');
    );
  );

  it('should successfully create trip with valid data', async () => {
    // Mock successful trip creation response
    (tripAPI.tripAPI.create as jest.Mock).mockResolvedValue(TEST_CONSTANTS.TEST_TRIP);

    const { getByPlaceholderText, getByText  = render(
      <Provider store={store>
        <CreateTripScreen navigation={mockNavigation />
      </Provider>
    );

    const titleInput = getByPlaceholderText('Trip Title');
    const destinationInput = getByPlaceholderText('Destination');
    const descriptionInput = getByPlaceholderText('Description (optional)');
    const createButton = getByText('Create Trip');

    // Fill in trip details
    fireEvent.changeText(titleInput, TEST_CONSTANTS.TEST_TRIP.name);
    fireEvent.changeText(destinationInput, TEST_CONSTANTS.TEST_TRIP.destination);
    fireEvent.changeText(descriptionInput, TEST_CONSTANTS.TEST_TRIP.description);

    // Press create button
    fireEvent.press(createButton);

    // Wait for trip creation to complete
    await waitFor(() => {
      expect(tripAPI.tripAPI.create).toHaveBeenCalled();
      expect(mockNavigation.goBack).toHaveBeenCalled();
    );
  );

  it('should show error message for failed trip creation', async () => {
    // Mock failed trip creation response
    (tripAPI.tripAPI.create as jest.Mock).mockRejectedValue({
      message: 'Failed to create trip',
    );

    // Mock Alert.alert
    const mockAlert = jest.spyOn(require('react-native').Alert, 'alert');
    mockAlert.mockImplementation(() => {);

    const { getByPlaceholderText, getByText  = render(
      <Provider store={store>
        <CreateTripScreen navigation={mockNavigation />
      </Provider>
    );

    const titleInput = getByPlaceholderText('Trip Title');
    const destinationInput = getByPlaceholderText('Destination');
    const createButton = getByText('Create Trip');

    // Fill in trip details
    fireEvent.changeText(titleInput, TEST_CONSTANTS.TEST_TRIP.name);
    fireEvent.changeText(destinationInput, TEST_CONSTANTS.TEST_TRIP.destination);

    // Press create button
    fireEvent.press(createButton);

    // Wait for error alert
    await waitFor(() => {
      expect(mockAlert).toHaveBeenCalledWith('Error', 'Failed to create trip. Please try again.');
    );
  );

  it('should allow user to select dates', () => {
    const { getByText  = render(
      <Provider store={store>
        <CreateTripScreen navigation={mockNavigation />
      </Provider>
    );

    const startDateButton = getByText('Start Date');
    const endDateButton = getByText('End Date');

    // Both date buttons should be present
    expect(startDateButton).toBeTruthy();
    expect(endDateButton).toBeTruthy();

    // TODO: Add actual date picker interaction tests when we can mock the DatePicker component
  );
);