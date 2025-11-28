import { db, auth } from '../../App';
import { 
  doc, 
  setDoc, 
  updateDoc, 
  getDoc,
  collection,
  query,
  where,
  getDocs
} from 'firebase/firestore';
import { Trip } from '../types';
import { generateInviteToken } from '../utils/auth';

interface ShareOptions {
  visibility: 'private' | 'link' | 'public';
  allowEdit: boolean;
  expireAt?: Date;
}

export class ShareService {
  /**
   * Generate an invite link for a trip
   */
  static async generateInviteLink(tripId: string): Promise<string> {
    try {
      const inviteToken = generateInviteToken();
      
      // Store the invite token in Firestore
      const inviteRef = doc(collection(db, 'invites'));
      await setDoc(inviteRef, {
        tripId,
        token: inviteToken,
        createdBy: auth.currentUser?.uid,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      });
      
      // Update trip with invite token
      const tripRef = doc(db, 'trips', tripId);
      await updateDoc(tripRef, {
        inviteLinkToken: inviteToken,
      });
      
      // Return the deep link
      return `tripweaver://invite/${inviteToken}`;
    } catch (error) {
      console.error('Error generating invite link:', error);
      throw error;
    }
  }
  
  /**
   * Validate an invite token
   */
  static async validateInviteToken(token: string): Promise<{ isValid: boolean; tripId?: string }> {
    try {
      const invitesRef = collection(db, 'invites');
      const q = query(invitesRef, where('token', '==', token));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return { isValid: false };
      }
      
      const inviteDoc = querySnapshot.docs[0];
      const inviteData = inviteDoc.data();
      
      // Check if expired
      if (inviteData.expiresAt && inviteData.expiresAt.toDate() < new Date()) {
        return { isValid: false };
      }
      
      return { 
        isValid: true, 
        tripId: inviteData.tripId 
      };
    } catch (error) {
      console.error('Error validating invite token:', error);
      return { isValid: false };
    }
  }
  
  /**
   * Share a trip with specific users
   */
  static async shareWithUsers(tripId: string, userIds: string[]): Promise<void> {
    try {
      const tripRef = doc(db, 'trips', tripId);
      
      // Get current shared users
      const tripSnap = await getDoc(tripRef);
      if (!tripSnap.exists()) {
        throw new Error('Trip not found');
      }
      
      const tripData = tripSnap.data() as Trip;
      const currentSharedWith = tripData.collaborators || [];
      
      // Merge and deduplicate using filter instead of Set to avoid downlevelIteration issue
      const mergedArray = [...currentSharedWith, ...userIds];
      const newSharedWith = mergedArray.filter((item, index) => 
        mergedArray.indexOf(item) === index
      );
      
      // Update trip
      await updateDoc(tripRef, {
        collaborators: newSharedWith,
        visibility: 'link', // Change visibility to link when shared
      });
    } catch (error) {
      console.error('Error sharing trip with users:', error);
      throw error;
    }
  }
  
  /**
   * Update trip sharing settings
   */
  static async updateSharingSettings(tripId: string, options: ShareOptions): Promise<void> {
    try {
      const tripRef = doc(db, 'trips', tripId);
      await updateDoc(tripRef, {
        visibility: options.visibility,
        allowEdit: options.allowEdit,
        ...(options.expireAt && { expireAt: options.expireAt }),
      });
    } catch (error) {
      console.error('Error updating sharing settings:', error);
      throw error;
    }
  }
  
  /**
   * Make a trip public
   */
  static async makePublic(tripId: string): Promise<void> {
    try {
      const tripRef = doc(db, 'trips', tripId);
      await updateDoc(tripRef, {
        visibility: 'public',
      });
      
      // Also add to public trips collection
      const publicTripRef = doc(collection(db, 'publicTrips'), tripId);
      const tripSnap = await getDoc(doc(db, 'trips', tripId));
      if (tripSnap.exists()) {
        await setDoc(publicTripRef, {
          ...tripSnap.data(),
          publishedAt: new Date(),
        });
      }
    } catch (error) {
      console.error('Error making trip public:', error);
      throw error;
    }
  }
  
  /**
   * Remove a user from a shared trip
   */
  static async removeUserFromTrip(tripId: string, userId: string): Promise<void> {
    try {
      const tripRef = doc(db, 'trips', tripId);
      
      // Get current shared users
      const tripSnap = await getDoc(tripRef);
      if (!tripSnap.exists()) {
        throw new Error('Trip not found');
      }
      
      const tripData = tripSnap.data() as Trip;
      const currentSharedWith = tripData.collaborators || [];
      
      // Remove user
      const newSharedWith = currentSharedWith.filter(id => id !== userId);
      
      // Update trip
      await updateDoc(tripRef, {
        collaborators: newSharedWith,
      });
    } catch (error) {
      console.error('Error removing user from trip:', error);
      throw error;
    }
  }
}

export default ShareService;