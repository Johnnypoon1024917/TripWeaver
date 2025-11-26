import { Trip, DayItinerary, Destination } from '../types';

const STORAGE_KEYS = {
  TRIPS: 'tripweaver_trips',
  ITINERARIES: 'tripweaver_itineraries',
  OFFLINE_QUEUE: 'tripweaver_offline_queue',
  USER_PREFERENCES: 'tripweaver_preferences',
  LAST_SYNC: 'tripweaver_last_sync',
};

interface OfflineAction {
  id: string;
  type: 'create' | 'update' | 'delete';
  entity: 'trip' | 'destination' | 'itinerary';
  data: any;
  timestamp: number;
}

class OfflineStorageService {
  /**
   * Save trips to local storage
   */
  async saveTrips(trips: Trip[]): Promise<void> {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.TRIPS, JSON.stringify(trips));
      }
    } catch (error) {
      console.error('Failed to save trips:', error);
    }
  }

  /**
   * Load trips from local storage
   */
  async loadTrips(): Promise<Trip[]> {
    try {
      if (typeof localStorage !== 'undefined') {
        const data = localStorage.getItem(STORAGE_KEYS.TRIPS);
        if (data) {
          return JSON.parse(data);
        }
      }
    } catch (error) {
      console.error('Failed to load trips:', error);
    }
    return [];
  }

  /**
   * Save itineraries to local storage
   */
  async saveItineraries(itineraries: DayItinerary[]): Promise<void> {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.ITINERARIES, JSON.stringify(itineraries));
      }
    } catch (error) {
      console.error('Failed to save itineraries:', error);
    }
  }

  /**
   * Load itineraries from local storage
   */
  async loadItineraries(): Promise<DayItinerary[]> {
    try {
      if (typeof localStorage !== 'undefined') {
        const data = localStorage.getItem(STORAGE_KEYS.ITINERARIES);
        if (data) {
          return JSON.parse(data);
        }
      }
    } catch (error) {
      console.error('Failed to load itineraries:', error);
    }
    return [];
  }

  /**
   * Queue action for offline sync
   */
  async queueOfflineAction(action: Omit<OfflineAction, 'id' | 'timestamp'>): Promise<void> {
    try {
      if (typeof localStorage !== 'undefined') {
        const queue = await this.getOfflineQueue();
        const newAction: OfflineAction = {
          ...action,
          id: Date.now().toString(),
          timestamp: Date.now(),
        };
        queue.push(newAction);
        localStorage.setItem(STORAGE_KEYS.OFFLINE_QUEUE, JSON.stringify(queue));
      }
    } catch (error) {
      console.error('Failed to queue offline action:', error);
    }
  }

  /**
   * Get offline queue
   */
  async getOfflineQueue(): Promise<OfflineAction[]> {
    try {
      if (typeof localStorage !== 'undefined') {
        const data = localStorage.getItem(STORAGE_KEYS.OFFLINE_QUEUE);
        if (data) {
          return JSON.parse(data);
        }
      }
    } catch (error) {
      console.error('Failed to get offline queue:', error);
    }
    return [];
  }

  /**
   * Clear offline queue
   */
  async clearOfflineQueue(): Promise<void> {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.OFFLINE_QUEUE, JSON.stringify([]));
      }
    } catch (error) {
      console.error('Failed to clear offline queue:', error);
    }
  }

  /**
   * Process offline queue (sync with server)
   */
  async processOfflineQueue(apiCallback: (action: OfflineAction) => Promise<boolean>): Promise<number> {
    const queue = await this.getOfflineQueue();
    let processed = 0;

    for (const action of queue) {
      try {
        const success = await apiCallback(action);
        if (success) {
          processed++;
        } else {
          break; // Stop processing if one fails
        }
      } catch (error) {
        console.error('Failed to process offline action:', error);
        break;
      }
    }

    // Remove processed actions from queue
    if (processed > 0) {
      const remainingQueue = queue.slice(processed);
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.OFFLINE_QUEUE, JSON.stringify(remainingQueue));
      }
    }

    return processed;
  }

  /**
   * Save user preferences
   */
  async savePreferences(preferences: any): Promise<void> {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.USER_PREFERENCES, JSON.stringify(preferences));
      }
    } catch (error) {
      console.error('Failed to save preferences:', error);
    }
  }

  /**
   * Load user preferences
   */
  async loadPreferences(): Promise<any> {
    try {
      if (typeof localStorage !== 'undefined') {
        const data = localStorage.getItem(STORAGE_KEYS.USER_PREFERENCES);
        if (data) {
          return JSON.parse(data);
        }
      }
    } catch (error) {
      console.error('Failed to load preferences:', error);
    }
    return null;
  }

  /**
   * Update last sync timestamp
   */
  async updateLastSync(): Promise<void> {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.LAST_SYNC, Date.now().toString());
      }
    } catch (error) {
      console.error('Failed to update last sync:', error);
    }
  }

  /**
   * Get last sync timestamp
   */
  async getLastSync(): Promise<number | null> {
    try {
      if (typeof localStorage !== 'undefined') {
        const data = localStorage.getItem(STORAGE_KEYS.LAST_SYNC);
        if (data) {
          return parseInt(data, 10);
        }
      }
    } catch (error) {
      console.error('Failed to get last sync:', error);
    }
    return null;
  }

  /**
   * Clear all storage
   */
  async clearAll(): Promise<void> {
    try {
      if (typeof localStorage !== 'undefined') {
        Object.values(STORAGE_KEYS).forEach((key) => {
          localStorage.removeItem(key);
        });
      }
    } catch (error) {
      console.error('Failed to clear storage:', error);
    }
  }

  /**
   * Check if online
   */
  isOnline(): boolean {
    if (typeof navigator !== 'undefined') {
      return navigator.onLine;
    }
    return true;
  }
}

export const offlineStorageService = new OfflineStorageService();
export default offlineStorageService;
