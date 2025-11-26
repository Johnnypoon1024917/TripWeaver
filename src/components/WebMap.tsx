import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../utils/theme';

interface WebMapProps {
  style?: any;
  region?: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
  children?: React.ReactNode;
}

export default function WebMap({ style, region, children }: WebMapProps) {
  return (
    <View style={[styles.container, style]}>
      <iframe
        style={{ width: '100%', height: '100%', border: 'none' }}
        src={`https://maps.google.com/maps?q=${region?.latitude || 25.033},${region?.longitude || 121.5654}&z=14&output=embed`}
      />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
