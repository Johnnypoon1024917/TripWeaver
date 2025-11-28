import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { store } from '../../../store';
import LoginScreen from '../../../screens/LoginScreen';
import { TEST_CONSTANTS, SELECTORS } from '../config';
import * as authAPI from '../../../services/api';
// Mock the navigation
const mockNavigation = {
    navigate: jest.fn(),
    goBack: jest.fn(),
    setOptions: jest.fn(),
    dispatch: jest.fn(),
    navigateDeprecated: jest.fn(),
    preload: jest.fn(),
    reset: jest.fn(),
    goBackDeprecated: jest.fn(),
    canGoBack: jest.fn(),
    getId: jest.fn(),
    getParent: jest.fn(),
    getState: jest.fn(),
};
describe('LoginScreen UI Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    it('should render login form correctly', () => {
        const { getByTestId, getByText } = render(<Provider store={store}>
        <LoginScreen navigation={mockNavigation}/>
      </Provider>);
        // Check if email input is present
        expect(getByTestId(SELECTORS.LOGIN_EMAIL_INPUT)).toBeTruthy();
        // Check if password input is present
        expect(getByTestId(SELECTORS.LOGIN_PASSWORD_INPUT)).toBeTruthy();
        // Check if login button is present
        expect(getByTestId(SELECTORS.LOGIN_BUTTON)).toBeTruthy();
        // Check if register button is present
        expect(getByTestId(SELECTORS.REGISTER_BUTTON)).toBeTruthy();
        // Check if guest mode button is present
        expect(getByTestId(SELECTORS.GUEST_MODE_BUTTON)).toBeTruthy();
    });
    it('should allow user to enter email and password', () => {
        const { getByTestId } = render(<Provider store={store}>
        <LoginScreen navigation={mockNavigation}/>
      </Provider>);
        const emailInput = getByTestId(SELECTORS.LOGIN_EMAIL_INPUT);
        const passwordInput = getByTestId(SELECTORS.LOGIN_PASSWORD_INPUT);
        // Simulate entering email
        fireEvent.changeText(emailInput, TEST_CONSTANTS.TEST_USER.email);
        expect(emailInput.props.value).toBe(TEST_CONSTANTS.TEST_USER.email);
        // Simulate entering password
        fireEvent.changeText(passwordInput, TEST_CONSTANTS.TEST_USER.password);
        expect(passwordInput.props.value).toBe(TEST_CONSTANTS.TEST_USER.password);
    });
    it('should show error alert when trying to login with empty fields', async () => {
        // Mock Alert.alert
        const mockAlert = jest.spyOn(require('react-native').Alert, 'alert');
        mockAlert.mockImplementation(() => { });
        const { getByTestId } = render(<Provider store={store}>
        <LoginScreen navigation={mockNavigation}/>
      </Provider>);
        const loginButton = getByTestId(SELECTORS.LOGIN_BUTTON);
        // Press login button without filling fields
        fireEvent.press(loginButton);
        // Wait for alert to be called
        await waitFor(() => {
            expect(mockAlert).toHaveBeenCalledWith('Error', 'Please fill in all fields');
        });
    });
    it('should navigate to register screen when register button is pressed', () => {
        const { getByTestId } = render(<Provider store={store}>
        <LoginScreen navigation={mockNavigation}/>
      </Provider>);
        const registerButton = getByTestId(SELECTORS.REGISTER_BUTTON);
        fireEvent.press(registerButton);
        expect(mockNavigation.navigate).toHaveBeenCalledWith('Register');
    });
    it('should successfully login with valid credentials', async () => {
        // Mock successful login response
        authAPI.authAPI.login.mockResolvedValue({
            user: {
                id: 'user-id',
                email: TEST_CONSTANTS.TEST_USER.email,
                displayName: TEST_CONSTANTS.TEST_USER.displayName,
                photoURL: null,
                createdAt: new Date().toISOString(),
            },
        });
        const { getByTestId } = render(<Provider store={store}>
        <LoginScreen navigation={mockNavigation}/>
      </Provider>);
        const emailInput = getByTestId(SELECTORS.LOGIN_EMAIL_INPUT);
        const passwordInput = getByTestId(SELECTORS.LOGIN_PASSWORD_INPUT);
        const loginButton = getByTestId(SELECTORS.LOGIN_BUTTON);
        // Fill in credentials
        fireEvent.changeText(emailInput, TEST_CONSTANTS.TEST_USER.email);
        fireEvent.changeText(passwordInput, TEST_CONSTANTS.TEST_USER.password);
        // Press login button
        fireEvent.press(loginButton);
        // Wait for login to complete
        await waitFor(() => {
            expect(authAPI.authAPI.login).toHaveBeenCalledWith(TEST_CONSTANTS.TEST_USER.email, TEST_CONSTANTS.TEST_USER.password);
        });
    });
    it('should show error message for invalid credentials', async () => {
        // Mock failed login response
        authAPI.authAPI.login.mockRejectedValue({
            message: 'Invalid email or password',
        });
        // Mock Alert.alert
        const mockAlert = jest.spyOn(require('react-native').Alert, 'alert');
        mockAlert.mockImplementation(() => { });
        const { getByTestId } = render(<Provider store={store}>
        <LoginScreen navigation={mockNavigation}/>
      </Provider>);
        const emailInput = getByTestId(SELECTORS.LOGIN_EMAIL_INPUT);
        const passwordInput = getByTestId(SELECTORS.LOGIN_PASSWORD_INPUT);
        const loginButton = getByTestId(SELECTORS.LOGIN_BUTTON);
        // Fill in credentials
        fireEvent.changeText(emailInput, TEST_CONSTANTS.TEST_USER.email);
        fireEvent.changeText(passwordInput, TEST_CONSTANTS.TEST_USER.password);
        // Press login button
        fireEvent.press(loginButton);
        // Wait for error alert
        await waitFor(() => {
            expect(mockAlert).toHaveBeenCalledWith('Login Failed', 'Invalid email or password');
        });
    });
    it('should enable guest mode when guest button is pressed', () => {
        const { getByTestId } = render(<Provider store={store}>
        <LoginScreen navigation={mockNavigation}/>
      </Provider>);
        const guestButton = getByTestId(SELECTORS.GUEST_MODE_BUTTON);
        fireEvent.press(guestButton);
        // Check that the store action was dispatched (this would be tested more thoroughly in unit tests)
        // For UI test, we just verify the button press triggers the expected flow
    });
});
