import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { Provider } from 'react-redux';
import { store } from '../../store';
// Custom render function that wraps components with necessary providers
export const renderWithProviders = (component) => {
    return render(<Provider store={store}>
      <NavigationContainer>
        {component}
      </NavigationContainer>
    </Provider>);
};
// Mock navigation helper
export const mockNavigation = {
    navigate: jest.fn(),
    goBack: jest.fn(),
    reset: jest.fn(),
    setParams: jest.fn(),
    setOptions: jest.fn(),
    addListener: jest.fn(),
    removeListener: jest.fn(),
    dispatch: jest.fn(),
    isFocused: jest.fn().mockReturnValue(true),
    canGoBack: jest.fn().mockReturnValue(true),
};
export const mockRoute = {
    key: 'test-key',
    name: 'TestRoute',
    params: {},
};
// Helper to wait for navigation
export const waitForNavigation = async (navigationFn) => {
    await act(async () => {
        navigationFn();
        await waitFor(() => { });
    });
};
// Helper to simulate user input
export const simulateTextInput = (element, value) => {
    fireEvent.changeText(element, value);
};
// Helper to simulate button press
export const simulatePress = (element) => {
    fireEvent.press(element);
};
// Helper to simulate scroll
export const simulateScroll = (element, offset) => {
    fireEvent.scroll(element, {
        nativeEvent: {
            contentOffset: offset,
            contentSize: { width: 100, height: 100 },
            layoutMeasurement: { width: 50, height: 50 },
        },
    });
};
