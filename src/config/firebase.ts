// Firebase configuration for TripWeaver
// Replace these values with your actual Firebase project config
export const firebaseConfig = {
  apiKey: "AIzaSyDheCC-C-6xMRJsR2EXhPxwlTIVY9hD_Qs",
  authDomain: "tripwaver-96009.firebaseapp.com",
  projectId: "tripwaver-96009",
  storageBucket: "tripwaver-96009.firebasestorage.app",
  messagingSenderId: "1037302258164",
  appId: "1:1037302258164:web:ba8767a13e984f24e301a1",
  measurementId: "G-TV2G87QQFJ"
;

// Firestore security rules (to be implemented in Firebase Console)
/*
rules_version = '2';
service cloud.firestore {
  match /databases/{database/documents {
    // Trips collection
    match /trips/{tripId {
      allow read, write: if request.auth != null && 
        (resource.data.visibility == 'public' || 
         resource.data.owner == request.auth.uid ||
         resource.data.sharedWith.hasAny([request.auth.uid]));
         
      // Allow creation of new trips
      allow create: if request.auth != null;
      
      // Subcollections
      match /onlineUsers/{userId {
        allow read, write: if request.auth != null;
      
    
    
    // Public trips collection
    match /publicTrips/{tripId {
      allow read: if true;
      allow write: if request.auth != null;
    
    
    // Feedback collection
    match /feedback/{feedbackId {
      allow read: if false;
      allow write: if request.auth != null;
    
  

*/