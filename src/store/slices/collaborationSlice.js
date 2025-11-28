import { createSlice } from '@reduxjs/toolkit';
import { db } from '../../services/firebaseService';
import { collection, doc, onSnapshot, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';
const initialState = {
    onlineUsers: {},
    isCollaborating: false,
    activeTripId: null,
};
export const collaborationSlice = createSlice({
    name: 'collaboration',
    initialState,
    reducers: {
        setOnlineUsers: (state, action) => {
            state.onlineUsers = action.payload;
        },
        addUser: (state, action) => {
            state.onlineUsers[action.payload.uid] = action.payload.user;
        },
        removeUser: (state, action) => {
            delete state.onlineUsers[action.payload];
        },
        setCollaborating: (state, action) => {
            state.isCollaborating = action.payload;
        },
        setActiveTrip: (state, action) => {
            state.activeTripId = action.payload;
        },
    },
});
export const { setOnlineUsers, addUser, removeUser, setCollaborating, setActiveTrip, } = collaborationSlice.actions;
// Thunk to join a trip collaboration session
export const joinCollaborationSession = (tripId, user) => {
    return async (dispatch, getState) => {
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
            const unsubscribe = onSnapshot(collection(db, 'trips', tripId, 'onlineUsers'), (snapshot) => {
                const onlineUsers = {};
                snapshot.forEach((doc) => {
                    onlineUsers[doc.id] = doc.data();
                });
                dispatch(setOnlineUsers(onlineUsers));
            });
            // Clean up function
            return () => {
                unsubscribe();
                // Remove user from online users when leaving
                deleteDoc(userRef);
            };
        }
        catch (error) {
            console.error('Error joining collaboration session:', error);
            dispatch(setCollaborating(false));
        }
    };
};
// Thunk to update user's last seen timestamp
export const updateLastSeen = (tripId, userId) => {
    return async (dispatch, getState) => {
        try {
            const userRef = doc(collection(db, 'trips', tripId, 'onlineUsers'), userId);
            await updateDoc(userRef, {
                lastSeen: new Date(),
            });
        }
        catch (error) {
            console.error('Error updating last seen:', error);
        }
    };
};
export default collaborationSlice.reducer;
