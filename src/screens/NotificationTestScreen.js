import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert  from 'react-native';
import { useDispatch  from 'react-redux';
import { NotificationUtils  from '../utils/notificationUtils';
import NotificationScheduler from '../services/notificationScheduler';
const NotificationTestScreen = () => {
    const dispatch = useDispatch();
    const sendTestNotification = async () => {
        try {
            await NotificationUtils.sendGeneralNotification('Test Notification', 'This is a test notification from TripWeaver!', { test: true );
            Alert.alert('Success', 'Test notification sent!');
        
        catch (error) {
            console.error('Error sending test notification:', error);
            Alert.alert('Error', 'Failed to send test notification');
        
    ;
    const sendTripReminder = async () => {
        try {
            await NotificationUtils.sendTripReminder('test-trip-id', 'Test Trip to Paris', 3);
            Alert.alert('Success', 'Trip reminder sent!');
        
        catch (error) {
            console.error('Error sending trip reminder:', error);
            Alert.alert('Error', 'Failed to send trip reminder');
        
    ;
    const sendBudgetAlert = async () => {
        try {
            await NotificationUtils.sendBudgetAlert('test-trip-id', 'Accommodation', 850, 1000);
            Alert.alert('Success', 'Budget alert sent!');
        
        catch (error) {
            console.error('Error sending budget alert:', error);
            Alert.alert('Error', 'Failed to send budget alert');
        
    ;
    const sendCollaborationNotification = async () => {
        try {
            await NotificationUtils.sendCollaborationNotification('test-trip-id', 'Added a new destination to the itinerary', 'John Doe');
            Alert.alert('Success', 'Collaboration notification sent!');
        
        catch (error) {
            console.error('Error sending collaboration notification:', error);
            Alert.alert('Error', 'Failed to send collaboration notification');
        
    ;
    const sendWeatherAlert = async () => {
        try {
            await NotificationUtils.sendWeatherAlert('test-trip-id', 'Paris, France', 'Thunderstorms', 'high');
            Alert.alert('Success', 'Weather alert sent!');
        
        catch (error) {
            console.error('Error sending weather alert:', error);
            Alert.alert('Error', 'Failed to send weather alert');
        
    ;
    const startScheduler = () => {
        NotificationScheduler.startScheduler();
        Alert.alert('Success', 'Notification scheduler started!');
    ;
    const stopScheduler = () => {
        NotificationScheduler.stopScheduler();
        Alert.alert('Success', 'Notification scheduler stopped!');
    ;
    return (<ScrollView style={styles.container>
      <View style={styles.header>
        <Text style={styles.title>Notification Test Center</Text>
        <Text style={styles.subtitle>
          Test different types of notifications and scheduler functionality
        </Text>
      </View>

      <View style={styles.section>
        <Text style={styles.sectionTitle>Send Test Notifications</Text>
        
        <TouchableOpacity style={styles.button onPress={sendTestNotification>
          <Text style={styles.buttonText>Send General Notification</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button onPress={sendTripReminder>
          <Text style={styles.buttonText>Send Trip Reminder</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button onPress={sendBudgetAlert>
          <Text style={styles.buttonText>Send Budget Alert</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button onPress={sendCollaborationNotification>
          <Text style={styles.buttonText>Send Collaboration Notification</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button onPress={sendWeatherAlert>
          <Text style={styles.buttonText>Send Weather Alert</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section>
        <Text style={styles.sectionTitle>Scheduler Controls</Text>
        
        <TouchableOpacity style={[styles.button, styles.successButton] onPress={startScheduler>
          <Text style={styles.buttonText>Start Scheduler</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.button, styles.dangerButton] onPress={stopScheduler>
          <Text style={styles.buttonText>Stop Scheduler</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.infoSection>
        <Text style={styles.infoTitle>How Notifications Work</Text>
        <Text style={styles.infoText>
          • Notifications are stored locally on your device{'\n'
          • They appear in the Notifications tab{'\n'
          • You can customize notification settings in Profile {'>' Notifications{'\n'
          • The scheduler automatically checks for notifications periodically{'\n'
          • Notifications respect your quiet hours settings
        </Text>
      </View>
    </ScrollView>);
;
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    ,
    header: {
        padding: 20,
        backgroundColor: '#fff',
        marginBottom: 10,
    ,
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 8,
    ,
    subtitle: {
        fontSize: 16,
        color: '#666',
    ,
    section: {
        backgroundColor: '#fff',
        marginVertical: 5,
        padding: 20,
    ,
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 16,
    ,
    button: {
        backgroundColor: '#007AFF',
        padding: 15,
        borderRadius: 8,
        marginBottom: 12,
        alignItems: 'center',
    ,
    successButton: {
        backgroundColor: '#34C759',
    ,
    dangerButton: {
        backgroundColor: '#FF3B30',
    ,
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    ,
    infoSection: {
        backgroundColor: '#fff',
        marginVertical: 5,
        padding: 20,
    ,
    infoTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 12,
    ,
    infoText: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
    ,
);
export default NotificationTestScreen;
