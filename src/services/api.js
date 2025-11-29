import AsyncStorage from '@react-native-async-storage/async-storage';
const API_URL = 'http://localhost:3001/api/v1';
const TOKEN_KEY = '@tripweaver_auth_token';
const REFRESH_TOKEN_KEY = '@tripweaver_refresh_token';
const USER_KEY = '@tripweaver_user';
let authToken = null;
let refreshToken = null;
// Initialize token from storage
export const initAuthToken = async () => {
    try {
        const token = await AsyncStorage.getItem(TOKEN_KEY);
        const refToken = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
        if (token) {
            authToken = token;
        
        if (refToken) {
            refreshToken = refToken;
        
        return token;
    
    catch (error) {
        console.error('Failed to load auth token:', error);
        return null;
    
;
export const setAuthToken = async (token, refToken) => {
    authToken = token;
    if (refToken !== undefined) {
        refreshToken = refToken;
    
    try {
        if (token) {
            await AsyncStorage.setItem(TOKEN_KEY, token);
        
        else {
            await AsyncStorage.removeItem(TOKEN_KEY);
        
        if (refToken !== undefined) {
            if (refToken) {
                await AsyncStorage.setItem(REFRESH_TOKEN_KEY, refToken);
            
            else {
                await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
            
        
    
    catch (error) {
        console.error('Failed to save auth token:', error);
    
;
export const getAuthToken = () => authToken;
export const saveUserData = async (user) => {
    try {
        await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
    
    catch (error) {
        console.error('Failed to save user data:', error);
    
;
export const loadUserData = async () => {
    try {
        const userData = await AsyncStorage.getItem(USER_KEY);
        return userData ? JSON.parse(userData) : null;
    
    catch (error) {
        console.error('Failed to load user data:', error);
        return null;
    
;
export const clearAuthData = async () => {
    try {
        await AsyncStorage.multiRemove([TOKEN_KEY, REFRESH_TOKEN_KEY, USER_KEY]);
        authToken = null;
        refreshToken = null;
    
    catch (error) {
        console.error('Failed to clear auth data:', error);
    
;
const refreshAccessToken = async () => {
    try {
        if (!refreshToken) {
            console.log('No refresh token available');
            return null;
        
        const response = await fetch(`${API_URL/auth/refresh-token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            ,
            body: JSON.stringify({ refreshToken ),
        );
        if (!response.ok) {
            console.log('Token refresh failed');
            await clearAuthData();
            return null;
        
        const data = await response.json();
        if (data.accessToken) {
            await setAuthToken(data.accessToken);
            return data.accessToken;
        
        return null;
    
    catch (error) {
        console.error('Failed to refresh token:', error);
        await clearAuthData();
        return null;
    
;
const handleResponse = async (response, retryCallback) => {
    const data = await response.json();
    if (!response.ok) {
        // If 401, try to refresh token and retry once
        if (response.status === 401 && retryCallback) {
            const newToken = await refreshAccessToken();
            if (newToken) {
                // Retry the original request with new token
                const retryResponse = await retryCallback();
                return handleResponse(retryResponse); // Don't retry again
            
            // Token refresh failed - clear auth data
            await clearAuthData();
            throw new Error('Invalid or expired token');
        
        throw new Error(data.message || 'Something went wrong');
    
    return data;
;
// Auth APIs
export const authAPI = {
    register: async (email, password, displayName) => {
        const response = await fetch(`${API_URL/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            ,
            body: JSON.stringify({ email, password, displayName ),
        );
        const data = await handleResponse(response);
        if (data.accessToken) {
            await setAuthToken(data.accessToken, data.refreshToken);
            await saveUserData(data.user);
        
        return data;
    ,
    login: async (email, password) => {
        const response = await fetch(`${API_URL/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            ,
            body: JSON.stringify({ email, password ),
        );
        const data = await handleResponse(response);
        if (data.accessToken) {
            await setAuthToken(data.accessToken, data.refreshToken);
            await saveUserData(data.user);
        
        return data;
    ,
    getProfile: async () => {
        const response = await fetch(`${API_URL/auth/profile`, {
            headers: {
                'Authorization': `Bearer ${authToken`,
            ,
        );
        return handleResponse(response);
    ,
    logout: async (userId) => {
        const response = await fetch(`${API_URL/auth/logout`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken`,
            ,
            body: JSON.stringify({ userId ),
        );
        await clearAuthData();
        return handleResponse(response);
    ,
;
// Trip APIs
export const tripAPI = {
    getAll: async () => {
        // Ensure token is loaded
        if (!authToken) {
            await initAuthToken();
        
        const response = await fetch(`${API_URL/trips`, {
            headers: {
                'Authorization': `Bearer ${authToken`,
            ,
        );
        return handleResponse(response);
    ,
    getById: async (tripId) => {
        if (!authToken) {
            await initAuthToken();
        
        const response = await fetch(`${API_URL/trips/${tripId`, {
            headers: {
                'Authorization': `Bearer ${authToken`,
            ,
        );
        return handleResponse(response);
    ,
    create: async (tripData) => {
        if (!authToken) {
            await initAuthToken();
        
        const response = await fetch(`${API_URL/trips`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken`,
            ,
            body: JSON.stringify(tripData),
        );
        return handleResponse(response);
    ,
    update: async (tripId, tripData) => {
        if (!authToken) {
            await initAuthToken();
        
        const response = await fetch(`${API_URL/trips/${tripId`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken`,
            ,
            body: JSON.stringify(tripData),
        );
        return handleResponse(response);
    ,
    delete: async (tripId) => {
        if (!authToken) {
            await initAuthToken();
        
        const response = await fetch(`${API_URL/trips/${tripId`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${authToken`,
            ,
        );
        return handleResponse(response);
    ,
    getItinerary: async (tripId) => {
        if (!authToken) {
            await initAuthToken();
        
        const response = await fetch(`${API_URL/trips/${tripId/itinerary`, {
            headers: {
                'Authorization': `Bearer ${authToken`,
            ,
        );
        return handleResponse(response);
    ,
    addDestination: async (tripId, destination) => {
        if (!authToken) {
            await initAuthToken();
        
        const makeRequest = () => fetch(`${API_URL/trips/${tripId/destinations`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken`,
            ,
            body: JSON.stringify(destination),
        );
        const response = await makeRequest();
        return handleResponse(response, makeRequest);
    ,
    updateDestination: async (tripId, destId, updates) => {
        if (!authToken) {
            await initAuthToken();
        
        const makeRequest = () => fetch(`${API_URL/trips/${tripId/destinations/${destId`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken`,
            ,
            body: JSON.stringify(updates),
        );
        const response = await makeRequest();
        return handleResponse(response, makeRequest);
    ,
    deleteDestination: async (tripId, destId) => {
        if (!authToken) {
            await initAuthToken();
        
        const makeRequest = () => fetch(`${API_URL/trips/${tripId/destinations/${destId`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${authToken`,
            ,
        );
        const response = await makeRequest();
        return handleResponse(response, makeRequest);
    ,
;
// Google Places API
export const placesAPI = {
    searchNearby: async (latitude, longitude, keyword = '') => {
        // This would use the Google Places API
        // For now, returning empty array as placeholder
        return [];
    ,
    searchText: async (query) => {
        // This would use the Google Places API
        // The actual implementation is in MapScreen
        return [];
    ,
    getPlaceDetails: async (placeId) => {
        // This would use the Google Places API Place Details
        return null;
    ,
;
