import React from 'react';
import { render } from '@testing-library/react-native';
import { Text, View } from 'react-native';

// Simple test to verify the testing environment is working
describe('Basic Test Setup', () => {
  it('should render a simple component', () => {
    const { getByText } = render(
      <View>
        <Text>Hello World</Text>
      </View>
    );
    
    expect(getByText('Hello World')).toBeTruthy();
  });
});