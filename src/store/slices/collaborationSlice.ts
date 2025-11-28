import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { db } from '../../../App';
import { collection, doc, onSnapshot, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';

interface OnlineUser {
  uid: string;
  displayName: string;
  photoURL?: string;
  lastSeen: Date;
}

interface CollaborationState {
  onlineUsers: Record<string, OnlineUser>;
  isCollaborating: boolean;
  activeTripId: string | null;
}

const initialState: CollaborationState = {
  onlineUsers: {},
  isCollaborating: false,
  activeTripId: null,
};

export const collaborationSlice = createSlice({
  name: 'collaboration',
  initialState,
  reducers: {
    setOnlineUsers: (state, action: PayloadAction<Record<string, OnlineUser>>) => {
      state.onlineUsers = action.payload;
    },
    addUser: (state, action: PayloadAction<{ uid: string; user: OnlineUser }>) => {
      state.onlineUsers[action.payload.uid] = action.payload.user;
    },
    removeUser: (state, action: PayloadAction<string>) => {
      delete state.onlineUsers[action.payload];
    },
    setCollaborating: (state, action: PayloadAction<boolean>) => {
      state.isCollaborating = action.payload;
    },
    setActiveTrip: (state, action: PayloadAction<string | null>) => {
      state.activeTripId = action.payload;
    },
  },
});

export const {
  setOnlineUsers,
  addUser,
  removeUser,
  setCollaborating,
  setActiveTrip,
} = collaborationSlice.actions;

// Thunk to join a trip collaboration session
export const joinCollaborationSession = (tripId: string, user: any) => {
  return async (dispatch: any, getState: any) => {
    try {
      dispatch(setCollaborating(true));
      dispatch(setActiveTrip(tripId));
      
      // Add user to online users list
      const userRef = doc(collection(db, 'trips', tripId, 'onlineUsers'), user.uid);
      await setDoc(userRef, {
        uid: user.uid,
        displayName: user.displayName,
        photoURL: user.photoURL,
        lastSeen: new Date(),
      });
      
      // Listen for online users changes
      const unsubscribe = onSnapshot(
        collection(db, 'trips', tripId, 'onlineUsers'),
        (snapshot) => {
          const onlineUsers: Record<string, OnlineUser> = {};
          snapshot.forEach((doc) => {
            onlineUsers[doc.id] = doc.data() as OnlineUser;
          });
          dispatch(setOnlineUsers(onlineUsers));
        }
      );
      
      // Clean up function
      return () => {
        unsubscribe();
        // Remove user from online users when leaving
        deleteDoc(userRef);
      };
    } catch (error) {
      console.error('Error joining collaboration session:', error);
      dispatch(setCollaborating(false));
    }
  };
};

// Thunk to update user's last seen timestamp
export const updateLastSeen = (tripId: string, userId: string) => {
  return async (dispatch: any, getState: any) => {
    try {
      const userRef = doc(collection(db, 'trips', tripId, 'onlineUsers'), userId);
      await updateDoc(userRef, {
        lastSeen: new Date(),
      });
    } catch (error) {
      console.error('Error updating last seen:', error);
    }
  };
};

export default collaborationSlice.reducer;