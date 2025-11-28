import { db } from '../services/firebaseService';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs,
  Timestamp
} from 'firebase/firestore';

interface Feedback {
  id?: string;
  userId: string;
  userEmail?: string;
  rating: number; // 1-5
  category: 'bug' | 'feature' | 'ux' | 'performance' | 'other';
  message: string;
  screenshot?: string; // base64 encoded
  appVersion?: string;
  platform?: string;
  userAgent?: string;
  timestamp: Timestamp;
}

export class FeedbackService {
  private static COLLECTION_NAME = 'feedback';
  
  /**
   * Submit feedback to Firebase
   */
  static async submitFeedback(feedback: Omit<Feedback, 'timestamp' | 'id'>): Promise<boolean> {
    try {
      const feedbackWithTimestamp: any = {
        ...feedback,
        timestamp: Timestamp.now(),
      };
      
      await addDoc(collection(db, this.COLLECTION_NAME), feedbackWithTimestamp);
      console.log('Feedback submitted successfully');
      return true;
    } catch (error) {
      console.error('Error submitting feedback:', error);
      return false;
    }
  }
  
  /**
   * Get feedback for a specific user
   */
  static async getUserFeedback(userId: string): Promise<Feedback[]> {
    try {
      const q = query(
        collection(db, this.COLLECTION_NAME), 
        where('userId', '==', userId)
      );
      
      const querySnapshot = await getDocs(q);
      const feedback: Feedback[] = [];
      
      querySnapshot.forEach((doc) => {
        feedback.push({
          id: doc.id,
          ...doc.data() as Omit<Feedback, 'id'>,
        } as Feedback);
      });
      
      return feedback;
    } catch (error) {
      console.error('Error getting user feedback:', error);
      return [];
    }
  }
  
  /**
   * Capture screenshot (web only)
   */
  static async captureScreenshot(): Promise<string | null> {
    try {
      if (typeof window !== 'undefined' && (window as any).html2canvas) {
        const html2canvas = (window as any).html2canvas;
        const canvas = await html2canvas(document.body);
        return canvas.toDataURL('image/png');
      }
      return null;
    } catch (error) {
      console.error('Error capturing screenshot:', error);
      return null;
    }
  }
  
  /**
   * Validate feedback data
   */
  static validateFeedback(feedback: Partial<Feedback>): string[] {
    const errors: string[] = [];
    
    if (!feedback.rating || feedback.rating < 1 || feedback.rating > 5) {
      errors.push('Rating must be between 1 and 5');
    }
    
    if (!feedback.category) {
      errors.push('Category is required');
    }
    
    if (!feedback.message || feedback.message.trim().length < 10) {
      errors.push('Message must be at least 10 characters long');
    }
    
    if (feedback.message && feedback.message.trim().length > 1000) {
      errors.push('Message must be less than 1000 characters');
    }
    
    return errors;
  }
  
  /**
   * Get app information
   */
  static getAppInfo(): any {
    return {
      appVersion: process.env.APP_VERSION || '1.0.0',
      platform: typeof navigator !== 'undefined' ? navigator.platform : 'unknown',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
    };
  }
  
  /**
   * Show feedback modal
   */
  static showFeedbackModal(): void {
    // This would be implemented in the UI layer
    console.log('Showing feedback modal');
  }
}

export default FeedbackService;