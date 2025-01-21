import { 
    collection, 
    doc, 
    getDocs, 
    setDoc, 
    query, 
    where, 
    orderBy, 
    limit,
    Timestamp,
    DocumentData 
  } from 'firebase/firestore';
  import { db } from './firebase';
  
  // Generic type for Firebase response
  type FirebaseResponse<T> = {
    success: boolean;
    data?: T;
    error?: string;
  };
  
  // Players
  export const getPlayers = async (): Promise<FirebaseResponse<DocumentData[]>> => {
    try {
      const querySnapshot = await getDocs(collection(db, 'players'));
      const players = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      return { success: true, data: players };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch players' 
      };
    }
  };
  
  // Matches
  export const createMatch = async (matchData: any): Promise<FirebaseResponse<DocumentData>> => {
    try {
      const matchRef = doc(collection(db, 'matches'));
      const timestamp = Timestamp.now();
      
      const match = {
        ...matchData,
        createdAt: timestamp,
        updatedAt: timestamp,
        status: 'scheduled'
      };
  
      await setDoc(matchRef, match);
      return { success: true, data: { id: matchRef.id, ...match } };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to create match' 
      };
    }
  };
  
  export const getRecentMatches = async (limitCount = 5): Promise<FirebaseResponse<DocumentData[]>> => {
    try {
      const q = query(
        collection(db, 'matches'),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      
      const querySnapshot = await getDocs(q);
      const matches = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      return { success: true, data: matches };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch matches' 
      };
    }
  };
  
  // Statistics
  export const getPlayerStats = async (playerId: string): Promise<FirebaseResponse<DocumentData>> => {
    try {
      const q = query(
        collection(db, 'matches'),
        where('players', 'array-contains', playerId)
      );
      
      const querySnapshot = await getDocs(q);
      const matches = querySnapshot.docs.map(doc => doc.data());
      
      // Calculate statistics
      const stats = {
        totalMatches: matches.length,
        wins: matches.filter(match => match.winner === playerId).length,
        // Add more statistics as needed
      };
      
      return { success: true, data: stats };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch player statistics' 
      };
    }
  };