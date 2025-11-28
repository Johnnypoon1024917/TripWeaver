const STORAGE_KEYS = {
    TRIPS: 'tripweaver_trips',
    ITINERARIES: 'tripweaver_itineraries',
    OFFLINE_QUEUE: 'tripweaver_offline_queue',
    USER_PREFERENCES: 'tripweaver_preferences',
    LAST_SYNC: 'tripweaver_last_sync',
    OFFLINE_MAPS: 'tripweaver_offline_maps',
    WEATHER_DATA: 'tripweaver_weather_data',
    PLACE_PHOTOS: 'tripweaver_place_photos',
};
class OfflineStorageService {
    /**
     * Save trips to local storage
     */
    async saveTrips(trips) {
        try {
            if (typeof localStorage !== 'undefined') {
                localStorage.setItem(STORAGE_KEYS.TRIPS, JSON.stringify(trips));
            }
        }
        catch (error) {
            console.error('Failed to save trips:', error);
        }
    }
    /**
     * Load trips from local storage
     */
    async loadTrips() {
        try {
            if (typeof localStorage !== 'undefined') {
                const data = localStorage.getItem(STORAGE_KEYS.TRIPS);
                if (data) {
                    return JSON.parse(data);
                }
            }
        }
        catch (error) {
            console.error('Failed to load trips:', error);
        }
        return [];
    }
    /**
     * Save itineraries to local storage
     */
    async saveItineraries(itineraries) {
        try {
            if (typeof localStorage !== 'undefined') {
                localStorage.setItem(STORAGE_KEYS.ITINERARIES, JSON.stringify(itineraries));
            }
        }
        catch (error) {
            console.error('Failed to save itineraries:', error);
        }
    }
    /**
     * Load itineraries from local storage
     */
    async loadItineraries() {
        try {
            if (typeof localStorage !== 'undefined') {
                const data = localStorage.getItem(STORAGE_KEYS.ITINERARIES);
                if (data) {
                    return JSON.parse(data);
                }
            }
        }
        catch (error) {
            console.error('Failed to load itineraries:', error);
        }
        return [];
    }
    /**
     * Queue action for offline sync
     */
    async queueOfflineAction(action) {
        try {
            if (typeof localStorage !== 'undefined') {
                const queue = await this.getOfflineQueue();
                const newAction = {
                    ...action,
                    id: Date.now().toString(),
                    timestamp: Date.now(),
                };
                queue.push(newAction);
                localStorage.setItem(STORAGE_KEYS.OFFLINE_QUEUE, JSON.stringify(queue));
            }
        }
        catch (error) {
            console.error('Failed to queue offline action:', error);
        }
    }
    /**
     * Get offline queue
     */
    async getOfflineQueue() {
        try {
            if (typeof localStorage !== 'undefined') {
                const data = localStorage.getItem(STORAGE_KEYS.OFFLINE_QUEUE);
                if (data) {
                    return JSON.parse(data);
                }
            }
        }
        catch (error) {
            console.error('Failed to get offline queue:', error);
        }
        return [];
    }
    /**
     * Clear offline queue
     */
    async clearOfflineQueue() {
        try {
            if (typeof localStorage !== 'undefined') {
                localStorage.setItem(STORAGE_KEYS.OFFLINE_QUEUE, JSON.stringify([]));
            }
        }
        catch (error) {
            console.error('Failed to clear offline queue:', error);
        }
    }
    /**
     * Process offline queue (sync with server)
     */
    async processOfflineQueue(apiCallback) {
        const queue = await this.getOfflineQueue();
        let processed = 0;
        for (const action of queue) {
            try {
                const success = await apiCallback(action);
                if (success) {
                    processed++;
                }
                else {
                    break; // Stop processing if one fails
                }
            }
            catch (error) {
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
    async savePreferences(preferences) {
        try {
            if (typeof localStorage !== 'undefined') {
                localStorage.setItem(STORAGE_KEYS.USER_PREFERENCES, JSON.stringify(preferences));
            }
        }
        catch (error) {
            console.error('Failed to save preferences:', error);
        }
    }
    /**
     * Load user preferences
     */
    async loadPreferences() {
        try {
            if (typeof localStorage !== 'undefined') {
                const data = localStorage.getItem(STORAGE_KEYS.USER_PREFERENCES);
                if (data) {
                    return JSON.parse(data);
                }
            }
        }
        catch (error) {
            console.error('Failed to load preferences:', error);
        }
        return null;
    }
    /**
     * Update last sync timestamp
     */
    async updateLastSync() {
        try {
            if (typeof localStorage !== 'undefined') {
                localStorage.setItem(STORAGE_KEYS.LAST_SYNC, Date.now().toString());
            }
        }
        catch (error) {
            console.error('Failed to update last sync:', error);
        }
    }
    /**
     * Get last sync timestamp
     */
    async getLastSync() {
        try {
            if (typeof localStorage !== 'undefined') {
                const data = localStorage.getItem(STORAGE_KEYS.LAST_SYNC);
                if (data) {
                    return parseInt(data, 10);
                }
            }
        }
        catch (error) {
            console.error('Failed to get last sync:', error);
        }
        return null;
    }
    /**
     * Save offline map data
     */
    async saveOfflineMap(mapId, mapData) {
        try {
            if (typeof localStorage !== 'undefined') {
                const existingMaps = await this.getOfflineMaps();
                existingMaps[mapId] = {
                    ...mapData,
                    timestamp: Date.now(),
                };
                localStorage.setItem(STORAGE_KEYS.OFFLINE_MAPS, JSON.stringify(existingMaps));
            }
        }
        catch (error) {
            console.error('Failed to save offline map:', error);
        }
    }
    /**
     * Get offline maps
     */
    async getOfflineMaps() {
        try {
            if (typeof localStorage !== 'undefined') {
                const data = localStorage.getItem(STORAGE_KEYS.OFFLINE_MAPS);
                if (data) {
                    return JSON.parse(data);
                }
            }
        }
        catch (error) {
            console.error('Failed to get offline maps:', error);
        }
        return {};
    }
    /**
     * Save weather data for a trip
     */
    async saveWeatherData(tripId, weatherData) {
        try {
            if (typeof localStorage !== 'undefined') {
                const existingWeather = await this.getWeatherData();
                existingWeather[tripId] = {
                    ...weatherData,
                    timestamp: Date.now(),
                };
                localStorage.setItem(STORAGE_KEYS.WEATHER_DATA, JSON.stringify(existingWeather));
            }
        }
        catch (error) {
            console.error('Failed to save weather data:', error);
        }
    }
    /**
     * Get weather data
     */
    async getWeatherData() {
        try {
            if (typeof localStorage !== 'undefined') {
                const data = localStorage.getItem(STORAGE_KEYS.WEATHER_DATA);
                if (data) {
                    return JSON.parse(data);
                }
            }
        }
        catch (error) {
            console.error('Failed to get weather data:', error);
        }
        return {};
    }
    /**
     * Save place photos
     */
    async savePlacePhotos(placeId, photos) {
        try {
            if (typeof localStorage !== 'undefined') {
                const existingPhotos = await this.getPlacePhotos();
                existingPhotos[placeId] = {
                    photos,
                    timestamp: Date.now(),
                };
                localStorage.setItem(STORAGE_KEYS.PLACE_PHOTOS, JSON.stringify(existingPhotos));
            }
        }
        catch (error) {
            console.error('Failed to save place photos:', error);
        }
    }
    /**
     * Get place photos
     */
    async getPlacePhotos() {
        try {
            if (typeof localStorage !== 'undefined') {
                const data = localStorage.getItem(STORAGE_KEYS.PLACE_PHOTOS);
                if (data) {
                    return JSON.parse(data);
                }
            }
        }
        catch (error) {
            console.error('Failed to get place photos:', error);
        }
        return {};
    }
    /**
     * Clear all storage
     */
    async clearAll() {
        try {
            if (typeof localStorage !== 'undefined') {
                Object.values(STORAGE_KEYS).forEach((key) => {
                    localStorage.removeItem(key);
                });
            }
        }
        catch (error) {
            console.error('Failed to clear storage:', error);
        }
    }
    /**
     * Check if online
     */
    isOnline() {
        if (typeof navigator !== 'undefined') {
            return navigator.onLine;
        }
        return true;
    }
}
export const offlineStorageService = new OfflineStorageService();
export default offlineStorageService;
