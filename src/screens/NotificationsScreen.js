import React from 'react';
import { View, StyleSheet } from 'react-native';
import NotificationCenter from '../components/NotificationCenter';
const NotificationsScreen = () => {
    return (<View style={styles.container}>
      <NotificationCenter />
    </View>);
};
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
});
export default NotificationsScreen;
