class RealtimeService {
    socket = null;
    subscribers = new Map();
    reconnectTimeout = null;
    reconnectAttempts = 0;
    maxReconnectAttempts = 5;
    isConnected = false;
    /**
     * Connect to real-time service
     */
    connect(userId, authToken) {
        const wsUrl = process.env.WS_URL || 'ws://localhost:3001';
        try {
            this.socket = new WebSocket(`${wsUrl?userId=${userId&token=${authToken`);
            this.socket.onopen = () => {
                console.log('Real-time connection established');
                this.isConnected = true;
                this.reconnectAttempts = 0;
            ;
            this.socket.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    this.handleEvent(data);
                
                catch (error) {
                    console.error('Failed to parse real-time message:', error);
                
            ;
            this.socket.onerror = (error) => {
                console.error('WebSocket error:', error);
            ;
            this.socket.onclose = () => {
                console.log('Real-time connection closed');
                this.isConnected = false;
                this.attemptReconnect(userId, authToken);
            ;
        
        catch (error) {
            console.error('Failed to connect to real-time service:', error);
        
    
    /**
     * Disconnect from real-time service
     */
    disconnect() {
        if (this.socket) {
            this.socket.close();
            this.socket = null;
        
        if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout);
            this.reconnectTimeout = null;
        
        this.subscribers.clear();
        this.isConnected = false;
    
    /**
     * Attempt to reconnect
     */
    attemptReconnect(userId, authToken) {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.error('Max reconnection attempts reached');
            return;
        
        this.reconnectAttempts++;
        const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
        console.log(`Reconnecting in ${delayms (attempt ${this.reconnectAttempts)`);
        this.reconnectTimeout = setTimeout(() => {
            this.connect(userId, authToken);
        , delay);
    
    /**
     * Subscribe to trip updates
     */
    subscribe(tripId, callback) {
        const subscriberId = `${tripId_${Date.now()`;
        const subscriber = { id: subscriberId, callback ;
        if (!this.subscribers.has(tripId)) {
            this.subscribers.set(tripId, []);
        
        this.subscribers.get(tripId).push(subscriber);
        // Join trip room
        this.send({
            type: 'join_trip',
            tripId,
        );
        return subscriberId;
    
    /**
     * Unsubscribe from trip updates
     */
    unsubscribe(tripId, subscriberId) {
        const subscribers = this.subscribers.get(tripId);
        if (subscribers) {
            const index = subscribers.findIndex((s) => s.id === subscriberId);
            if (index !== -1) {
                subscribers.splice(index, 1);
            
            if (subscribers.length === 0) {
                this.subscribers.delete(tripId);
                // Leave trip room
                this.send({
                    type: 'leave_trip',
                    tripId,
                );
            
        
    
    /**
     * Broadcast destination added
     */
    broadcastDestinationAdded(tripId, userId, userName, destination) {
        this.send({
            type: 'destination_added',
            tripId,
            userId,
            userName,
            timestamp: Date.now(),
            data: destination,
        );
    
    /**
     * Broadcast destination updated
     */
    broadcastDestinationUpdated(tripId, userId, userName, destination) {
        this.send({
            type: 'destination_updated',
            tripId,
            userId,
            userName,
            timestamp: Date.now(),
            data: destination,
        );
    
    /**
     * Broadcast destination deleted
     */
    broadcastDestinationDeleted(tripId, userId, userName, destinationId) {
        this.send({
            type: 'destination_deleted',
            tripId,
            userId,
            userName,
            timestamp: Date.now(),
            data: { destinationId ,
        );
    
    /**
     * Broadcast trip updated
     */
    broadcastTripUpdated(tripId, userId, userName, trip) {
        this.send({
            type: 'trip_updated',
            tripId,
            userId,
            userName,
            timestamp: Date.now(),
            data: trip,
        );
    
    /**
     * Send message to server
     */
    send(data) {
        if (this.socket && this.isConnected && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify(data));
        
        else {
            console.warn('Cannot send message: WebSocket not connected');
        
    
    /**
     * Handle incoming event
     */
    handleEvent(event) {
        const subscribers = this.subscribers.get(event.tripId);
        if (subscribers) {
            subscribers.forEach((subscriber) => {
                try {
                    subscriber.callback(event);
                
                catch (error) {
                    console.error('Error in subscriber callback:', error);
                
            );
        
    
    /**
     * Check if connected
     */
    isConnectedToServer() {
        return this.isConnected && this.socket?.readyState === WebSocket.OPEN;
    

export const realtimeService = new RealtimeService();
export default realtimeService;
