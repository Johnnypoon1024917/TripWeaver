import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '../utils/theme';
export default function WebMap({ style, region, children }) {
    return (<View style={[styles.container, style]}>
      <iframe style={{ width: '100%', height: '100%', border: 'none' }} src={`https://maps.google.com/maps?q=${region?.latitude || 25.033},${region?.longitude || 121.5654}&z=14&output=embed`}/>
      {children}
    </View>);
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
});
