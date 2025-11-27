import { db } from '../../App';
import { 
  collection, 
  addDoc, 
  Timestamp,
  doc,
  updateDoc,
  increment
} from 'firebase/firestore';

interface EventData {
  name: string;
  userId?: string;
  properties?: Record<string, any>;
  timestamp: Timestamp;
  sessionId?: string;
  userAgent?: string;
  platform?: string;
}

export class AnalyticsService {
  private static COLLECTION_NAME = 'analyticsEvents';
  private static enabled = true;
  private static sessionId = Math.random().toString(36).substring(2, 15);
  
  /**
   * Track an event
   */
  static async trackEvent(
    name: string, 
    properties?: Record<string, any>,
    userId?: string
  ): Promise<boolean> {
    if (!this.enabled) return false;
    
    try {
      const event: any = {
        name,
        userId,
        properties,
        timestamp: Timestamp.now(),
        sessionId: this.sessionId,
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
        platform: typeof navigator !== 'undefined' ? navigator.platform : 'unknown',
      };
      
      await addDoc(collection(db, this.COLLECTION_NAME), event);
      
      // Also update aggregate counters
      await this.updateAggregateCounters(name);
      
      return true;
    } catch (error) {
      console.debug('Analytics tracking failed:', error);
      return false;
    }
  }
  
  /**
   * Update aggregate counters for events
   */
  private static async updateAggregateCounters(eventName: string): Promise<void> {
    try {
      // In a real implementation, this would update aggregate counters
      // For now, we'll just log that it would happen
      console.debug(`Would update aggregate counter for event: ${eventName}`);
    } catch (error) {
      console.debug('Failed to update aggregate counters:', error);
    }
  }
  
  /**
   * Track page view
   */
  static async trackPageView(
    pageName: string,
    userId?: string
  ): Promise<boolean> {
    return this.trackEvent('page_view', { page: pageName }, userId);
  }
  
  /**
   * Track user sign in
   */
  static async trackSignIn(
    method: string,
    userId?: string
  ): Promise<boolean> {
    return this.trackEvent('sign_in', { method }, userId);
  }
  
  /**
   * Track user sign out
   */
  static async trackSignOut(userId?: string): Promise<boolean> {
    return this.trackEvent('sign_out', {}, userId);
  }
  
  /**
   * Track trip creation
   */
  static async trackTripCreated(
    tripId: string,
    userId?: string
  ): Promise<boolean> {
    return this.trackEvent('trip_created', { tripId }, userId);
  }
  
  /**
   * Track destination added
   */
  static async trackDestinationAdded(
    tripId: string,
    destinationId: string,
    userId?: string
  ): Promise<boolean> {
    return this.trackEvent('destination_added', { tripId, destinationId }, userId);
  }
  
  /**
   * Enable/disable analytics
   */
  static setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }
  
  /**
   * Set user ID for tracking
   */
  static setUserId(userId: string): void {
    // In a real implementation, this would set the user ID for all future events
    console.debug(`Analytics user ID set to: ${userId}`);
  }
}

export default AnalyticsService;