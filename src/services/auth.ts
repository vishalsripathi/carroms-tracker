import { 
    GoogleAuthProvider, 
    signInWithPopup, 
    signOut as firebaseSignOut,
    onAuthStateChanged,
    User as FirebaseUser
  } from 'firebase/auth';
  import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
  import { auth, db } from './firebase';
  import type { User } from '../types';
  
  const googleProvider = new GoogleAuthProvider();
  
  export const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      await createOrUpdateUser(result.user);
      return result.user;
    } catch (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    }
  };
  
  export const signOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };
  
  export const createOrUpdateUser = async (firebaseUser: FirebaseUser) => {
    const userRef = doc(db, 'users', firebaseUser.uid);
    const userSnap = await getDoc(userRef);
    
    const userData = {
      id: firebaseUser.uid,
      email: firebaseUser.email,
      name: firebaseUser.displayName,
      photoURL: firebaseUser.photoURL,
      lastActive: serverTimestamp(),
    };
  
    if (!userSnap.exists()) {
      // New user
      const newUser = {
        ...userData,
        joinedDate: serverTimestamp(),
        stats: {
          totalGames: 0,
          wins: 0,
          losses: 0,
          streak: 0,
          lastPlayed: null,
        },
        preferences: {
          notifications: true,
          theme: 'light',
        },
      };
      
      await setDoc(userRef, newUser);
      return newUser;
    } else {
      // Existing user - just update last active
      await setDoc(userRef, userData, { merge: true });
      return userSnap.data();
    }
  };
  
  export const subscribeToAuthChanges = (callback: (user: FirebaseUser | null) => void) => {
    return onAuthStateChanged(auth, callback);
  };