import { db } from '../services/firebaseService';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
export class AnalyticsService {
    static COLLECTION_NAME = 'analyticsEvents';
    static enabled = true;
    static sessionId = Math.random().toString(36).substring(2, 15);
    /**
     * Track an event
     */
    static async trackEvent(name, properties, userId) {
        if (!this.enabled)
            return false;
        try {
            const event = {
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
        }
        catch (error) {
            console.debug('Analytics tracking failed:', error);
            return false;
        }
    }
    /**
     * Update aggregate counters for events
     */
    static async updateAggregateCounters(eventName) {
        try {
            // In a real implementation, this would update aggregate counters
            // For now, we'll just log that it would happen
            console.debug(`Would update aggregate counter for event: ${eventName}`);
        }
        catch (error) {
            console.debug('Failed to update aggregate counters:', error);
        }
    }
    /**
     * Track page view
     */
    static async trackPageView(pageName, userId) {
        return this.trackEvent('page_view', { page: pageName }, userId);
    }
    /**
     * Track user sign in
     */
    static async trackSignIn(method, userId) {
        return this.trackEvent('sign_in', { method }, userId);
    }
    /**
     * Track user sign out
     */
    static async trackSignOut(userId) {
        return this.trackEvent('sign_out', {}, userId);
    }
    /**
     * Track trip creation
     */
    static async trackTripCreated(tripId, userId) {
        return this.trackEvent('trip_created', { tripId }, userId);
    }
    /**
     * Track destination added
     */
    static async trackDestinationAdded(tripId, destinationId, userId) {
        return this.trackEvent('destination_added', { tripId, destinationId }, userId);
    }
    /**
     * Enable/disable analytics
     */
    static setEnabled(enabled) {
        this.enabled = enabled;
    }
    /**
     * Set user ID for tracking
     */
    static setUserId(userId) {
        // In a real implementation, this would set the user ID for all future events
        console.debug(`Analytics user ID set to: ${userId}`);
    }
}
export default AnalyticsService;
