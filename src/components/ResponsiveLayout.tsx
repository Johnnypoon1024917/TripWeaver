import React from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';

interface ResponsiveLayoutProps {
  children: React.ReactNode;
  style?: any;
}

export const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({ 
  children, 
  style 
}) => {
  const { width } = useWindowDimensions();
  
  // Define breakpoints
  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;
  const isDesktop = width >= 1024;
  
  return (
    <View 
      style={[
        styles.container,
        isMobile && styles.mobileContainer,
        isTablet && styles.tabletContainer,
        isDesktop && styles.desktopContainer,
        style
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mobileContainer: {
    padding: 16,
  },
  tabletContainer: {
    padding: 24,
  },
  desktopContainer: {
    padding: 32,
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
  },
});

export default ResponsiveLayout;