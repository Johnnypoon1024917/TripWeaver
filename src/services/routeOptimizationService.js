import { GOOGLE_MAPS_API_KEY  from '../config/maps';
class RouteOptimizationService {
    baseUrl = 'https://maps.googleapis.com/maps/api/directions/json';
    /**
     * Optimize route using Traveling Salesman Problem algorithm
     * Uses nearest neighbor heuristic for simplicity
     */
    async optimizeRoute(destinations, mode = 'driving') {
        if (destinations.length <= 1) {
            return {
                orderedDestinations: destinations,
                totalDistance: 0,
                totalDuration: 0,
                segments: [],
            ;
        
        // Get distance matrix for all destinations
        const distanceMatrix = await this.getDistanceMatrix(destinations, mode);
        // Apply nearest neighbor algorithm
        const optimizedOrder = this.nearestNeighborTSP(distanceMatrix);
        // Reorder destinations based on optimization
        const orderedDestinations = optimizedOrder.map((index) => destinations[index]);
        // Calculate segments
        const segments = [];
        let totalDistance = 0;
        let totalDuration = 0;
        for (let i = 0; i < orderedDestinations.length - 1; i++) {
            const segment = await this.getRouteSegment(orderedDestinations[i], orderedDestinations[i + 1], mode);
            segments.push(segment);
            totalDistance += segment.distance;
            totalDuration += segment.duration;
        
        // Update order property
        orderedDestinations.forEach((dest, index) => {
            dest.order = index;
        );
        return {
            orderedDestinations,
            totalDistance,
            totalDuration,
            segments,
        ;
    
    /**
     * Get distance matrix for all destinations
     */
    async getDistanceMatrix(destinations, mode) {
        const origins = destinations
            .map((d) => `${d.latitude,${d.longitude`)
            .join('|');
        const dests = origins;
        const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origins&destinations=${dests&mode=${mode&key=${GOOGLE_MAPS_API_KEY`;
        try {
            const response = await fetch(url);
            const data = await response.json();
            if (data.status === 'OK') {
                const matrix = [];
                data.rows.forEach((row) => {
                    const distances = row.elements.map((el) => el.distance?.value || Infinity);
                    matrix.push(distances);
                );
                return matrix;
            
        
        catch (error) {
            console.error('Distance matrix error:', error);
        
        // Fallback: calculate straight-line distances
        return this.calculateStraightLineMatrix(destinations);
    
    /**
     * Nearest neighbor TSP algorithm
     */
    nearestNeighborTSP(distanceMatrix) {
        const n = distanceMatrix.length;
        const visited = new Array(n).fill(false);
        const path = [0]; // Start from first destination
        visited[0] = true;
        for (let i = 1; i < n; i++) {
            let nearest = -1;
            let minDistance = Infinity;
            const current = path[path.length - 1];
            for (let j = 0; j < n; j++) {
                if (!visited[j] && distanceMatrix[current][j] < minDistance) {
                    nearest = j;
                    minDistance = distanceMatrix[current][j];
                
            
            if (nearest !== -1) {
                path.push(nearest);
                visited[nearest] = true;
            
        
        return path;
    
    /**
     * Get route segment between two destinations
     */
    async getRouteSegment(from, to, mode) {
        const origin = `${from.latitude,${from.longitude`;
        const destination = `${to.latitude,${to.longitude`;
        const url = `${this.baseUrl?origin=${origin&destination=${destination&mode=${mode&key=${GOOGLE_MAPS_API_KEY`;
        try {
            const response = await fetch(url);
            const data = await response.json();
            if (data.routes && data.routes.length > 0) {
                const leg = data.routes[0].legs[0];
                return {
                    from,
                    to,
                    distance: leg.distance.value,
                    duration: leg.duration.value,
                    mode,
                ;
            
        
        catch (error) {
            console.error('Route segment error:', error);
        
        // Fallback: straight-line distance
        const distance = this.calculateDistance({ lat: from.latitude, lng: from.longitude , { lat: to.latitude, lng: to.longitude );
        return {
            from,
            to,
            distance: distance * 1000, // Convert to meters
            duration: (distance / 50) * 3600, // Assume 50 km/h
            mode,
        ;
    
    /**
     * Calculate straight-line distance matrix
     */
    calculateStraightLineMatrix(destinations) {
        const matrix = [];
        for (let i = 0; i < destinations.length; i++) {
            const row = [];
            for (let j = 0; j < destinations.length; j++) {
                if (i === j) {
                    row.push(0);
                
                else {
                    const dist = this.calculateDistance({ lat: destinations[i].latitude, lng: destinations[i].longitude , { lat: destinations[j].latitude, lng: destinations[j].longitude );
                    row.push(dist * 1000); // Convert to meters
                
            
            matrix.push(row);
        
        return matrix;
    
    /**
     * Calculate distance between two coordinates (Haversine formula)
     */
    calculateDistance(point1, point2) {
        const R = 6371; // Earth's radius in km
        const dLat = this.toRad(point2.lat - point1.lat);
        const dLng = this.toRad(point2.lng - point1.lng);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.toRad(point1.lat)) *
                Math.cos(this.toRad(point2.lat)) *
                Math.sin(dLng / 2) *
                Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    
    toRad(degrees) {
        return degrees * (Math.PI / 180);
    
    /**
     * Get detailed directions between destinations
     */
    async getDirections(from, to, mode = 'driving') {
        const origin = `${from.latitude,${from.longitude`;
        const destination = `${to.latitude,${to.longitude`;
        const url = `${this.baseUrl?origin=${origin&destination=${destination&mode=${mode&key=${GOOGLE_MAPS_API_KEY`;
        try {
            const response = await fetch(url);
            const data = await response.json();
            if (data.status === 'OK') {
                return data;
            
        
        catch (error) {
            console.error('Get directions error:', error);
        
        return null;
    
    /**
     * Format duration in human-readable format
     */
    formatDuration(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        if (hours > 0) {
            return `${hoursh ${minutesmin`;
        
        return `${minutesmin`;
    
    /**
     * Format distance in human-readable format
     */
    formatDistance(meters) {
        if (meters >= 1000) {
            return `${(meters / 1000).toFixed(1) km`;
        
        return `${Math.round(meters) m`;
    

export const routeOptimizationService = new RouteOptimizationService();
export default routeOptimizationService;
