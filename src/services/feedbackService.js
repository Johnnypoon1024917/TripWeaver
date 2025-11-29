import { db  from '../services/firebaseService';
import { collection, addDoc, query, where, getDocs, Timestamp  from 'firebase/firestore';
export class FeedbackService {
    static COLLECTION_NAME = 'feedback';
    /**
     * Submit feedback to Firebase
     */
    static async submitFeedback(feedback) {
        try {
            const feedbackWithTimestamp = {
                ...feedback,
                timestamp: Timestamp.now(),
            ;
            await addDoc(collection(db, this.COLLECTION_NAME), feedbackWithTimestamp);
            console.log('Feedback submitted successfully');
            return true;
        
        catch (error) {
            console.error('Error submitting feedback:', error);
            return false;
        
    
    /**
     * Get feedback for a specific user
     */
    static async getUserFeedback(userId) {
        try {
            const q = query(collection(db, this.COLLECTION_NAME), where('userId', '==', userId));
            const querySnapshot = await getDocs(q);
            const feedback = [];
            querySnapshot.forEach((doc) => {
                feedback.push({
                    id: doc.id,
                    ...doc.data(),
                );
            );
            return feedback;
        
        catch (error) {
            console.error('Error getting user feedback:', error);
            return [];
        
    
    /**
     * Capture screenshot (web only)
     */
    static async captureScreenshot() {
        try {
            if (typeof window !== 'undefined' && window.html2canvas) {
                const html2canvas = window.html2canvas;
                const canvas = await html2canvas(document.body);
                return canvas.toDataURL('image/png');
            
            return null;
        
        catch (error) {
            console.error('Error capturing screenshot:', error);
            return null;
        
    
    /**
     * Validate feedback data
     */
    static validateFeedback(feedback) {
        const errors = [];
        if (!feedback.rating || feedback.rating < 1 || feedback.rating > 5) {
            errors.push('Rating must be between 1 and 5');
        
        if (!feedback.category) {
            errors.push('Category is required');
        
        if (!feedback.message || feedback.message.trim().length < 10) {
            errors.push('Message must be at least 10 characters long');
        
        if (feedback.message && feedback.message.trim().length > 1000) {
            errors.push('Message must be less than 1000 characters');
        
        return errors;
    
    /**
     * Get app information
     */
    static getAppInfo() {
        return {
            appVersion: process.env.APP_VERSION || '1.0.0',
            platform: typeof navigator !== 'undefined' ? navigator.platform : 'unknown',
            userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
        ;
    
    /**
     * Show feedback modal
     */
    static showFeedbackModal() {
        // This would be implemented in the UI layer
        console.log('Showing feedback modal');
    

export default FeedbackService;
