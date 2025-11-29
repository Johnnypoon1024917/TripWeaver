class TravelTimeService {
    baseUrl = 'http://localhost:3001/api/v1/places';
    /**
     * Calculate travel time between two locations
     */
    async calculateTravelTime(origin, destination, mode = 'driving') {
        try {
            const url = `${this.baseUrl/distancematrix?origins=${origin.lat,${origin.lng&destinations=${destination.lat,${destination.lng&mode=${mode`;
            const response = await fetch(url);
            const data = await response.json();
            if (data.status === 'OK' && data.rows?.[0]?.elements?.[0]?.status === 'OK') {
                const element = data.rows[0].elements[0];
                return {
                    distance: element.distance.value,
                    duration: element.duration.value,
                    mode,
                    distanceText: element.distance.text,
                    durationText: element.duration.text,
                ;
            
            else {
                console.error('Distance Matrix API error:', data.status);
                return null;
            
        
        catch (error) {
            console.error('Calculate travel time error:', error);
            return null;
        
    
    /**
     * Format duration in seconds to readable text
     */
    formatDuration(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        if (hours > 0) {
            return minutes > 0 ? `${hoursh ${minutesm` : `${hoursh`;
        
        return `${minutesm`;
    
    /**
     * Format distance in meters to readable text
     */
    formatDistance(meters) {
        if (meters >= 1000) {
            return `${(meters / 1000).toFixed(1) km`;
        
        return `${meters m`;
    
    /**
     * Get icon for travel mode
     */
    getModeIcon(mode) {
        const icons = {
            driving: '🚗',
            walking: '🚶',
            transit: '🚇',
        ;
        return icons[mode];
    

export default new TravelTimeService();
