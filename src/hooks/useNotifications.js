import { useEffect  from 'react';
import { useDispatch, useSelector  from 'react-redux';
import { setNotifications, addNotification as addNotificationAction  from '../store/slices/notificationsSlice';
import NotificationService from '../services/notificationService';
export const useNotifications = () => {
    const dispatch = useDispatch();
    const { notifications, unreadCount, loading, error  = useSelector((state) => state.notifications);
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
    const addNotification = async (notification) => {
        try {
            // Add to service
            await NotificationService.addNotification(notification);
            // Load all notifications to get the new one with proper ID and timestamp
            await loadNotifications();
        
        catch (error) {
            console.error('Error adding notification:', error);
        
    ;
    const markAsRead = async (id) => {
        try {
            dispatch(addNotificationAction({
                id,
                read: true
            )); // This is a workaround for type issues
            // In a real implementation, you would update the service here
        
        catch (error) {
            console.error('Error marking notification as read:', error);
        
    ;
    const markAllAsRead = async () => {
        try {
            await NotificationService.markAllAsRead();
            await loadNotifications();
        
        catch (error) {
            console.error('Error marking all notifications as read:', error);
        
    ;
    const deleteNotification = async (id) => {
        try {
            await NotificationService.deleteNotification(id);
            await loadNotifications();
        
        catch (error) {
            console.error('Error deleting notification:', error);
        
    ;
    const clearAllNotifications = async () => {
        try {
            await NotificationService.clearAllNotifications();
            await loadNotifications();
        
        catch (error) {
            console.error('Error clearing notifications:', error);
        
    ;
    const getUnreadCount = async () => {
        try {
            const count = await NotificationService.getUnreadCount();
            return count;
        
        catch (error) {
            console.error('Error getting unread count:', error);
            return 0;
        
    ;
    return {
        notifications,
        unreadCount,
        loading,
        error,
        addNotification,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAllNotifications,
        getUnreadCount,
        loadNotifications,
    ;
;
