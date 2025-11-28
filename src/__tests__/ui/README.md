# TripWeaver UI Testing

This directory contains UI tests for the TripWeaver application using React Native Testing Library.

## Test Structure

```
__tests__/ui/
├── screens/           # Tests for individual screens
├── navigation/        # Tests for navigation flows
├── setup.tsx          # Test setup and utilities
├── config.ts         # Test constants and configuration
├── testSuite.ts      # Test suite runner
└── README.md         # This file
```

## Running Tests

To run all UI tests:

```bash
npm test
```

To run tests for a specific screen:

```bash
npm test LoginScreen.test.tsx
npm test HomeScreen.test.tsx
```

## Test Coverage

The UI tests cover the following areas:

1. **Authentication Flow**
   - Login screen functionality
   - Registration flow
   - Guest mode access

2. **Main Screens**
   - Home screen (trip listing)
   - Create trip screen
   - Itinerary screen
   - Budget tracking screen
   - Map screen
   - Profile screen

3. **Navigation**
   - Tab navigation
   - Screen transitions
   - Deep linking

4. **User Interactions**
   - Form submissions
   - Button clicks
   - Input validation
   - Drag and drop (where applicable)

## Writing New Tests

1. Create a new test file in the appropriate directory
2. Use the existing tests as templates
3. Follow the naming convention `[ComponentName].test.tsx`
4. Import necessary utilities from `setup.tsx`
5. Use selectors from `config.ts` for consistency

## Mocking Strategy

- Redux state is mocked using `jest.mock('react-redux')`
- API calls are mocked using `jest.mock()` for service modules
- Navigation is mocked using `@react-navigation/native` mocks
- Native modules are mocked through Jest setup

## Test IDs

UI components use test IDs for reliable element selection:
- Use semantic test IDs that describe the element's purpose
- Follow the pattern: `[screen]-[element]-[purpose]`
- Defined in `config.ts` for consistency

## Continuous Integration

UI tests are run automatically in CI pipeline on every pull request.