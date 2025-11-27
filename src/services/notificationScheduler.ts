import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { NotificationUtils } from '../utils/notificationUtils';
import { Trip } from '../types';

class NotificationScheduler {
  private static instance: NotificationScheduler;
  private intervalId: NodeJS.Timeout | null = null;
  private checkInterval = 60 * 60 * 1000; // Check every hour

  private constructor() {}

  static getInstance(): NotificationScheduler {
    if (!NotificationScheduler.instance) {
      NotificationScheduler.instance = new NotificationScheduler();
    }
    return NotificationScheduler.instance;
  }

  startScheduler() {
    // Clear any existing interval
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }

    // Start the scheduler
    this.intervalId = setInterval(() => {
      this.checkAndSendNotifications();
    }, this.checkInterval);

    // Run immediately on start
    this.checkAndSendNotifications();
  }

  stopScheduler() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private async checkAndSendNotifications() {
    try {
      // In a real implementation, you would get trips from the store or API
      // For now, we'll simulate this
      console.log('Checking for notifications to send...');
      
      // This would normally be connected to the Redux store
      // const trips = useSelector((state: RootState) => state.trips.items);
      
      // For demonstration, we'll just log that the check happened
      // In a real implementation, you would check:
      // 1. Upcoming trips for reminders
      // 2. Budget thresholds for alerts
      // 3. Weather conditions for alerts
      // 4. Collaboration updates
      
    } catch (error) {
      console.error('Error checking notifications:', error);
    }
  }

  // Schedule trip reminders
  async scheduleTripReminders(trip: Trip) {
    try {
      if (!trip.startDate) return;
      
      const today = new Date();
      const tripDate = new Date(trip.startDate);
      const timeDiff = tripDate.getTime() - today.getTime();
      const daysUntil = Math.ceil(timeDiff / (1000 * 3600 * 24));
      
      // Only send reminders for trips within 7 days
      if (daysUntil <= 7 && daysUntil >= 0) {
        await NotificationUtils.sendTripReminder(trip.id, trip.title, daysUntil);
      }
    } catch (error) {
      console.error('Error scheduling trip reminders:', error);
    }
  }

  // Schedule budget alerts
  async scheduleBudgetAlerts(trip: Trip) {
    try {
      // This would check all budget categories for the trip
      // For now, we'll just log that the check happened
      console.log(`Checking budget alerts for trip: ${trip.title}`);
      
      // In a real implementation, you would:
      // 1. Get budget data for the trip
      // 2. Calculate spending percentages
      // 3. Send alerts for categories over threshold
    } catch (error) {
      console.error('Error scheduling budget alerts:', error);
    }
  }

  // Schedule weather alerts
  async scheduleWeatherAlerts(trip: Trip) {
    try {
      // This would check weather forecasts for trip destinations
      // For now, we'll just log that the check happened
      console.log(`Checking weather alerts for trip: ${trip.title}`);
      
      // In a real implementation, you would:
      // 1. Get destination locations for the trip
      // 2. Fetch weather forecasts
      // 3. Send alerts for severe weather conditions
    } catch (error) {
      console.error('Error scheduling weather alerts:', error);
    }
  }
}

export default NotificationScheduler.getInstance();