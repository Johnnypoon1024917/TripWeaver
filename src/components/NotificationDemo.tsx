import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useDispatch } from 'react-redux';
import { addNotification } from '../store/slices/notificationsSlice';

const NotificationDemo: React.FC = () => {
  const dispatch = useDispatch();

  const sendSampleNotification = () => {
    const sampleNotification = {
      id: Math.random().toString(36).substr(2, 9),
      title: 'Welcome to TripWeaver!',
      body: 'This is a sample notification to demonstrate the notification system.',
      timestamp: new Date(),
      read: false,
      type: 'general' as const,
    };

    dispatch(addNotification(sampleNotification));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Notification Demo</Text>
      <Text style={styles.description}>
        Tap the button below to send a sample notification that will appear in the Notifications tab.
      </Text>
      <TouchableOpacity style={styles.button} onPress={sendSampleNotification}>
        <Text style={styles.buttonText}>Send Sample Notification</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    margin: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    lineHeight: 22,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default NotificationDemo;