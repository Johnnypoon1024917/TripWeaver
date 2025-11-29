import React, { useEffect, useState  from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert  from 'react-native';
import { useDispatch, useSelector  from 'react-redux';
import { MaterialIcons  from 'react-native-vector-icons';
import { setNotifications, markAsRead, markAllAsRead, deleteNotification  from '../store/slices/notificationsSlice';
import NotificationService from '../services/notificationService';
const NotificationCenter = () => {
    const dispatch = useDispatch();
    const { notifications, unreadCount  = useSelector((state) => state.notifications);
    const [refreshing, setRefreshing] = useState(false);
    useEffect(() => {
        loadNotifications();
    , []);
    const loadNotifications = async () => {
        try {
            const notificationList = await NotificationService.getAllNotifications();
            dispatch(setNotifications(notificationList));
        
        catch (error) {
            console.error('Error loading notifications:', error);
        
    ;
    const handleRefresh = async () => {
        setRefreshing(true);
        await loadNotifications();
        setRefreshing(false);
    ;
    const handleMarkAsRead = (id) => {
        dispatch(markAsRead(id));
    ;
    const handleMarkAllAsRead = () => {
        dispatch(markAllAsRead());
    ;
    const handleDeleteNotification = (id) => {
        dispatch(deleteNotification(id));
    ;
    const handleDeleteAll = () => {
        Alert.alert('Clear All Notifications', 'Are you sure you want to delete all notifications?', [
            { text: 'Cancel', style: 'cancel' ,
            {
                text: 'Delete',
                style: 'destructive',
                onPress: () => {
                    NotificationService.clearAllNotifications();
                    dispatch(setNotifications([]));
                
            
        ]);
    ;
    const renderNotification = ({ item ) => (<View style={[styles.notificationItem, !item.read && styles.unreadNotification]>
      <View style={styles.notificationContent>
        <Text style={[styles.notificationTitle, !item.read && styles.unreadTitle]>
          {item.title
        </Text>
        <Text style={styles.notificationBody>{item.body</Text>
        <Text style={styles.timestamp>
          {new Date(item.timestamp).toLocaleDateString() at {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' )
        </Text>
      </View>
      <View style={styles.notificationActions>
        {!item.read && (<TouchableOpacity onPress={() => handleMarkAsRead(item.id) style={styles.actionButton>
            <MaterialIcons name="done" size={20 color="#007AFF"/>
          </TouchableOpacity>)
        <TouchableOpacity onPress={() => handleDeleteNotification(item.id) style={styles.actionButton>
          <MaterialIcons name="delete" size={20 color="#FF3B30"/>
        </TouchableOpacity>
      </View>
    </View>);
    return (<View style={styles.container>
      <View style={styles.header>
        <Text style={styles.headerTitle>Notifications</Text>
        <View style={styles.headerActions>
          {notifications.length > 0 && (<TouchableOpacity onPress={handleMarkAllAsRead style={styles.headerButton>
              <Text style={styles.headerButtonText>Mark All Read</Text>
            </TouchableOpacity>)
          {notifications.length > 0 && (<TouchableOpacity onPress={handleDeleteAll style={styles.headerButton>
              <Text style={styles.headerButtonText>Clear All</Text>
            </TouchableOpacity>)
        </View>
      </View>
      
      {notifications.length === 0 ? (<View style={styles.emptyContainer>
          <MaterialIcons name="notifications-off" size={64 color="#C7C7CC"/>
          <Text style={styles.emptyText>No notifications yet</Text>
          <Text style={styles.emptySubtext>You'll see notifications about your trips here</Text>
        </View>) : (<FlatList data={notifications renderItem={renderNotification keyExtractor={(item) => item.id refreshing={refreshing onRefresh={handleRefresh contentContainerStyle={styles.listContent/>)
    </View>);
;
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    ,
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5EA',
    ,
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#000',
    ,
    headerActions: {
        flexDirection: 'row',
    ,
    headerButton: {
        marginLeft: 16,
    ,
    headerButtonText: {
        color: '#007AFF',
        fontSize: 16,
    ,
    listContent: {
        padding: 16,
    ,
    notificationItem: {
        flexDirection: 'row',
        padding: 16,
        marginBottom: 8,
        borderRadius: 8,
        backgroundColor: '#F2F2F7',
    ,
    unreadNotification: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#007AFF',
    ,
    notificationContent: {
        flex: 1,
    ,
    notificationTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#8E8E93',
        marginBottom: 4,
    ,
    unreadTitle: {
        color: '#000',
        fontWeight: 'bold',
    ,
    notificationBody: {
        fontSize: 14,
        color: '#3A3A3C',
        marginBottom: 8,
    ,
    timestamp: {
        fontSize: 12,
        color: '#8E8E93',
    ,
    notificationActions: {
        flexDirection: 'row',
        alignItems: 'center',
    ,
    actionButton: {
        padding: 8,
        marginLeft: 8,
    ,
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 64,
    ,
    emptyText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#000',
        marginTop: 16,
    ,
    emptySubtext: {
        fontSize: 14,
        color: '#8E8E93',
        marginTop: 8,
        textAlign: 'center',
        paddingHorizontal: 32,
    ,
);
export default NotificationCenter;
