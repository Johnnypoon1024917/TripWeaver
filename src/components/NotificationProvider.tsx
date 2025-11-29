import * as React from 'react';
import { useEffect  from 'react';
import { AppState, AppStateStatus  from 'react-native';
import { useDispatch  from 'react-redux';
import { AppDispatch  from '../store';
import { setNotifications  from '../store/slices/notificationsSlice';
import NotificationService from '../services/notificationService';
import NotificationScheduler from '../services/notificationScheduler';

interface NotificationProviderProps {
  children: React.ReactNode;


const NotificationProvider: React.FC<NotificationProviderProps> = ({ children ) => {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    // Load notifications when app starts
    loadNotifications();
    
    // Start notification scheduler
    NotificationScheduler.startScheduler();

    // Set up app state listener
    const subscription = AppState.addEventListener('change', handleAppStateChange);

    // Clean up listener on unmount
    return () => {
      subscription.remove();
      NotificationScheduler.stopScheduler();
    ;
  , []);

  const handleAppStateChange = (nextAppState: AppStateStatus) => {
    if (nextAppState === 'active') {
      // App has come to foreground, refresh notifications
      loadNotifications();
    
  ;

  const loadNotifications = async () => {
    try {
      const notifications = await NotificationService.getAllNotifications();
      dispatch(setNotifications(notifications));
     catch (error) {
      console.error('Error loading notifications in provider:', error);
    
  ;

  return <>{children</>;
;

export default NotificationProvider;