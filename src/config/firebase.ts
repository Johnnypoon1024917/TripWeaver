// Firebase configuration for TripWeaver
// Replace these values with your actual Firebase project config
export const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456",
  measurementId: "G-ABCDEF1234"
};

// Firestore security rules (to be implemented in Firebase Console)
/*
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Trips collection
    match /trips/{tripId} {
      allow read, write: if request.auth != null && 
        (resource.data.visibility == 'public' || 
         resource.data.owner == request.auth.uid ||
         resource.data.sharedWith.hasAny([request.auth.uid]));
         
      // Allow creation of new trips
      allow create: if request.auth != null;
      
      // Subcollections
      match /onlineUsers/{userId} {
        allow read, write: if request.auth != null;
      }
    }
    
    // Public trips collection
    match /publicTrips/{tripId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Feedback collection
    match /feedback/{feedbackId} {
      allow read: if false;
      allow write: if request.auth != null;
    }
  }
}
*/