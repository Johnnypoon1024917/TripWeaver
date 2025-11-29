// Test configuration and constants
export const TEST_CONSTANTS = {
    // User credentials for testing
    TEST_USER: {
        email: 'test@example.com',
        password: 'password123',
        displayName: 'Test User'
    ,
    // Trip data for testing
    TEST_TRIP: {
        id: 'test-trip-id',
        name: 'Test Trip to Paris',
        destination: 'Paris, France',
        startDate: new Date('2023-06-01'),
        endDate: new Date('2023-06-07'),
        description: 'A wonderful trip to Paris'
    ,
    // Destination data for testing
    TEST_DESTINATION: {
        id: 'test-destination-id',
        name: 'Eiffel Tower',
        address: 'Champ de Mars, 5 Av. Anatole France, 75007 Paris, France',
        latitude: 48.8584,
        longitude: 2.2945,
        category: 'attraction',
        estimatedCost: 25,
        duration: 120,
        notes: 'Must visit at night for beautiful views'
    ,
    // Budget data for testing
    TEST_BUDGET_ITEM: {
        id: 'test-budget-id',
        category: 'Accommodation',
        allocated: 1000,
        spent: 0,
        currency: 'USD'
    ,
    // Expense data for testing
    TEST_EXPENSE: {
        id: 'test-expense-id',
        name: 'Hotel Room',
        amount: 150,
        category: 'Accommodation',
        date: new Date('2023-06-01'),
        notes: 'Paid for 3 nights'
    
;
// Test selectors for UI elements
export const SELECTORS = {
    // Authentication screens
    LOGIN_EMAIL_INPUT: 'login-email-input',
    LOGIN_PASSWORD_INPUT: 'login-password-input',
    LOGIN_BUTTON: 'login-button',
    REGISTER_BUTTON: 'register-button',
    GUEST_MODE_BUTTON: 'guest-mode-button',
    // Home screen
    CREATE_TRIP_BUTTON: 'create-trip-button',
    TRIP_LIST_ITEM: 'trip-list-item',
    // Create trip screen
    TRIP_NAME_INPUT: 'trip-name-input',
    DESTINATION_INPUT: 'destination-input',
    START_DATE_PICKER: 'start-date-picker',
    END_DATE_PICKER: 'end-date-picker',
    CREATE_BUTTON: 'create-button',
    // Itinerary screen
    ADD_DESTINATION_BUTTON: 'add-destination-button',
    DESTINATION_CARD: 'destination-card',
    DRAG_HANDLE: 'drag-handle',
    // Budget screen
    ADD_BUDGET_CATEGORY_BUTTON: 'add-budget-category-button',
    BUDGET_CATEGORY_ITEM: 'budget-category-item',
    ADD_EXPENSE_BUTTON: 'add-expense-button',
    // Map screen
    MAP_VIEW: 'map-view',
    MAP_MARKER: 'map-marker',
    // Navigation
    NAVIGATION_TAB_HOME: 'nav-tab-home',
    NAVIGATION_TAB_ITINERARY: 'nav-tab-itinerary',
    NAVIGATION_TAB_MAP: 'nav-tab-map',
    NAVIGATION_TAB_BUDGET: 'nav-tab-budget',
    NAVIGATION_TAB_PROFILE: 'nav-tab-profile'
;
// Test timeouts
export const TIMEOUTS = {
    SHORT: 1000,
    MEDIUM: 3000,
    LONG: 5000
;
// Test assertions
export const ASSERTIONS = {
    SUCCESS_MESSAGE: 'Operation completed successfully',
    ERROR_MESSAGE: 'An error occurred',
    LOADING_INDICATOR: 'loading-indicator'
;
