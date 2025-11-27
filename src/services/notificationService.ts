import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';

export interface Notification {
  id: string;
  title: string;
  body: string;
  timestamp: Date;
  read: boolean;
  type: 'reminder' | 'collaboration' | 'budget' | 'weather' | 'general';
  tripId?: string;
  data?: any;
}

class NotificationService {
  private static instance: NotificationService;
  private notificationsKey = 'tripweaver_notifications';

  private constructor() {}

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  async getAllNotifications(): Promise<Notification[]> {
    try {
      const notificationsJson = await AsyncStorage.getItem(this.notificationsKey);
      return notificationsJson ? JSON.parse(notificationsJson) : [];
    } catch (error) {
      console.error('Error getting notifications:', error);
      return [];
    }
  }

  async saveNotifications(notifications: Notification[]): Promise<void> {
    try {
      await AsyncStorage.setItem(this.notificationsKey, JSON.stringify(notifications));
    } catch (error) {
      console.error('Error saving notifications:', error);
    }
  }

  async addNotification(notification: Omit<Notification, 'id' | 'timestamp' | 'read'>): Promise<void> {
    try {
      const notifications = await this.getAllNotifications();
      const newNotification: Notification = {
        ...notification,
        id: Math.random().toString(36).substr(2, 9),
        timestamp: new Date(),
        read: false,
      };
      
      notifications.unshift(newNotification);
      await this.saveNotifications(notifications);
      
      // Schedule push notification
      await this.schedulePushNotification(newNotification);
    } catch (error) {
      console.error('Error adding notification:', error);
    }
  }

  async markAsRead(id: string): Promise<void> {
    try {
      const notifications = await this.getAllNotifications();
      const updatedNotifications = notifications.map(notification => 
        notification.id === id ? { ...notification, read: true } : notification
      );
      await this.saveNotifications(updatedNotifications);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }

  async markAllAsRead(): Promise<void> {
    try {
      const notifications = await this.getAllNotifications();
      const updatedNotifications = notifications.map(notification => ({
        ...notification,
        read: true
      }));
      await this.saveNotifications(updatedNotifications);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }

  async deleteNotification(id: string): Promise<void> {
    try {
      const notifications = await this.getAllNotifications();
      const updatedNotifications = notifications.filter(notification => notification.id !== id);
      await this.saveNotifications(updatedNotifications);
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  }

  async clearAllNotifications(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.notificationsKey);
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  }

  async getUnreadCount(): Promise<number> {
    try {
      const notifications = await this.getAllNotifications();
      return notifications.filter(notification => !notification.read).length;
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  }

  private async schedulePushNotification(notification: Notification): Promise<void> {
    try {
      // In a real implementation, you would schedule the actual push notification here
      // For now, we'll just log it
      console.log('Scheduled push notification:', notification);
      
      // Example of how you might schedule a push notification:
      /*
      await Notifications.scheduleNotificationAsync({
        content: {
          title: notification.title,
          body: notification.body,
          data: notification.data,
        },
        trigger: null, // or a date for scheduled notifications
      });
      */
    } catch (error) {
      console.error('Error scheduling push notification:', error);
    }
  }

  // Trip reminder notifications
  async scheduleTripReminders(tripId: string, tripName: string, startDate: Date): Promise<void> {
    try {
      // Schedule a reminder 1 day before the trip
      const oneDayBefore = new Date(startDate);
      oneDayBefore.setDate(oneDayBefore.getDate() - 1);
      
      if (oneDayBefore > new Date()) {
        await this.addNotification({
          title: 'Upcoming Trip Reminder',
          body: `Your trip "${tripName}" starts tomorrow!`,
          type: 'reminder',
          tripId,
        });
      }
      
      // Schedule a reminder 1 hour before the trip starts
      const oneHourBefore = new Date(startDate);
      oneHourBefore.setHours(oneHourBefore.getHours() - 1);
      
      if (oneHourBefore > new Date()) {
        await this.addNotification({
          title: 'Trip Starting Soon',
          body: `Your trip "${tripName}" starts in one hour!`,
          type: 'reminder',
          tripId,
        });
      }
    } catch (error) {
      console.error('Error scheduling trip reminders:', error);
    }
  }

  // Budget alerts
  async scheduleBudgetAlert(
    tripId: string, 
    categoryName: string, 
    spent: number, 
    budget: number
  ): Promise<void> {
    try {
      const percentage = (spent / budget) * 100;
      
      if (percentage >= 90) {
        await this.addNotification({
          title: 'Budget Alert',
          body: `You've spent ${percentage.toFixed(0)}% of your ${categoryName} budget!`,
          type: 'budget',
          tripId,
        });
      } else if (percentage >= 75) {
        await this.addNotification({
          title: 'Budget Warning',
          body: `You've spent ${percentage.toFixed(0)}% of your ${categoryName} budget.`,
          type: 'budget',
          tripId,
        });
      }
    } catch (error) {
      console.error('Error scheduling budget alert:', error);
    }
  }
}

export default NotificationService.getInstance();