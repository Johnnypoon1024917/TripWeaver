import React from 'react';
import { render, fireEvent, waitFor  from '@testing-library/react-native';
import { Provider  from 'react-redux';
import { store  from '../../../store';
import EnhancedBudgetScreen from '../../../screens/EnhancedBudgetScreen';
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
  budget: {
    budgets: [
      {
        id: 'budget-1',
        tripId: TEST_CONSTANTS.TEST_TRIP.id,
        category: 'Accommodation',
        allocated: 1000,
        spent: 350,
        currency: 'USD',
      ,
      {
        id: 'budget-2',
        tripId: TEST_CONSTANTS.TEST_TRIP.id,
        category: 'Food',
        allocated: 500,
        spent: 120,
        currency: 'USD',
      ,
    ],
    expenses: [
      {
        id: 'expense-1',
        budgetId: 'budget-1',
        name: 'Hotel Room',
        amount: 150,
        date: new Date('2023-06-01'),
        notes: '3 nights at Hotel ABC',
      ,
      {
        id: 'expense-2',
        budgetId: 'budget-1',
        name: 'Airbnb',
        amount: 200,
        date: new Date('2023-06-02'),
        notes: '4 nights at Airbnb XYZ',
      ,
      {
        id: 'expense-3',
        budgetId: 'budget-2',
        name: 'Restaurant Dinner',
        amount: 45,
        date: new Date('2023-06-01'),
        notes: 'Dinner at Restaurant ABC',
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

describe('BudgetScreen UI Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  );

  it('should render budget screen with categories and expenses', () => {
    const { getByText, getByTestId, getAllByTestId  = render(
      <Provider store={store>
        <EnhancedBudgetScreen route={{ key: 'test', name: 'TripDetail', params: { tripId: 'test-trip-id'   />
      </Provider>
    );

    // Check if trip title is displayed
    expect(getByText(TEST_CONSTANTS.TEST_TRIP.name)).toBeTruthy();
    
    // Check if budget category items are rendered
    const budgetItems = getAllByTestId(SELECTORS.BUDGET_CATEGORY_ITEM);
    expect(budgetItems).toHaveLength(2);
    
    // Check if add budget category button is present
    expect(getByTestId(SELECTORS.ADD_BUDGET_CATEGORY_BUTTON)).toBeTruthy();
    
    // Check if add expense button is present
    expect(getByTestId(SELECTORS.ADD_EXPENSE_BUTTON)).toBeTruthy();
    
    // Check if budget category details are displayed correctly
    expect(getByText('Accommodation')).toBeTruthy();
    expect(getByText('$350 / $1000')).toBeTruthy();
    expect(getByText('Food')).toBeTruthy();
    expect(getByText('$120 / $500')).toBeTruthy();
  );

  it('should display correct expense information', () => {
    const { getByText  = render(
      <Provider store={store>
        <EnhancedBudgetScreen route={{ key: 'test', name: 'TripDetail', params: { tripId: 'test-trip-id'   />
      </Provider>
    );

    // Check expense details
    expect(getByText('Hotel Room')).toBeTruthy();
    expect(getByText('$150')).toBeTruthy();
    expect(getByText('3 nights at Hotel ABC')).toBeTruthy();
    
    expect(getByText('Airbnb')).toBeTruthy();
    expect(getByText('$200')).toBeTruthy();
    expect(getByText('4 nights at Airbnb XYZ')).toBeTruthy();
    
    expect(getByText('Restaurant Dinner')).toBeTruthy();
    expect(getByText('$45')).toBeTruthy();
    expect(getByText('Dinner at Restaurant ABC')).toBeTruthy();
  );

  it('should show empty state when no budget categories exist', () => {
    // Mock empty budget state
    const emptyStore = {
      ...mockStore,
      budget: {
        ...mockStore.budget,
        budgets: [],
        expenses: [],
      ,
    ;
    
    jest.mock('react-redux', () => ({
      ...jest.requireActual('react-redux'),
      useSelector: jest.fn().mockImplementation(selector => selector(emptyStore)),
    ));

    const { getByText, getByTestId, getAllByTestId  = render(
      <Provider store={store>
        <EnhancedBudgetScreen route={{ key: 'test', name: 'TripDetail', params: { tripId: 'test-trip-id'   />
      </Provider>
    );

    expect(getByText('No budget categories yet')).toBeTruthy();
    expect(getByText('Add your first budget category to get started')).toBeTruthy();
    expect(getByTestId(SELECTORS.ADD_BUDGET_CATEGORY_BUTTON)).toBeTruthy();
  );

  it('should calculate and display budget totals correctly', () => {
    const { getByText  = render(
      <Provider store={store>
        <EnhancedBudgetScreen route={{ key: 'test', name: 'TripDetail', params: { tripId: 'test-trip-id'   />
      </Provider>
    );

    // Check total budget calculation
    // Accommodation: $1000 allocated, $350 spent
    // Food: $500 allocated, $120 spent
    // Total: $1500 allocated, $470 spent
    expect(getByText('Total Budget')).toBeTruthy();
    expect(getByText('$470 / $1500')).toBeTruthy();
    
    // Check remaining amount
    expect(getByText('Remaining')).toBeTruthy();
    expect(getByText('$1030')).toBeTruthy();
  );

  it('should allow adding new budget categories', () => {
    const { getByTestId  = render(
      <Provider store={store>
        <EnhancedBudgetScreen route={{ key: 'test', name: 'TripDetail', params: { tripId: 'test-trip-id'   />
      </Provider>
    );

    const addCategoryButton = getByTestId(SELECTORS.ADD_BUDGET_CATEGORY_BUTTON);
    fireEvent.press(addCategoryButton);
    
    // TODO: Add actual modal interaction tests when we can mock the modal component
  );

  it('should allow adding new expenses', () => {
    const { getByTestId  = render(
      <Provider store={store>
        <EnhancedBudgetScreen route={{ key: 'test', name: 'TripDetail', params: { tripId: 'test-trip-id'   />
      </Provider>
    );

    const addExpenseButton = getByTestId(SELECTORS.ADD_EXPENSE_BUTTON);
    fireEvent.press(addExpenseButton);
    
    // TODO: Add actual modal interaction tests when we can mock the modal component
  );
);