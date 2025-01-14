import { 
    collection, 
    doc, 
    getDocs, 
    getDoc, 
    setDoc, 
    updateDoc, 
    query, 
    where, 
    orderBy,
    limit,
    Timestamp 
  } from 'firebase/firestore';
  import { db } from './firebase';
  import type { User, Match } from '../types';
  
  // User operations
  export const getUser = async (userId: string): Promise<User | null> => {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (!userDoc.exists()) return null;
      return userDoc.data() as User;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  };
  
  // Match operations
  export const createMatch = async (matchData: Omit<Match, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const matchesRef = collection(db, 'matches');
      const newMatchRef = doc(matchesRef);
      
      const match: Match = {
        ...matchData,
        id: newMatchRef.id,
        createdAt: Timestamp.now().toDate(),
        updatedAt: Timestamp.now().toDate(),
      };
  
      await setDoc(newMatchRef, match);
      return match;
    } catch (error) {
      console.error('Error creating match:', error);
      throw error;
    }
  };
  
  export const getRecentMatches = async (limit = 10) => {
    try {
      const matchesRef = collection(db, 'matches');
      const q = query(
        matchesRef,
        orderBy('date', 'desc'),
        limit
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => doc.data() as Match);
    } catch (error) {
      console.error('Error fetching recent matches:', error);
      throw error;
    }
  };
  
  // Update match result
  export const updateMatchResult = async (
    matchId: string, 
    team1Score: number, 
    team2Score: number
  ) => {
    try {
      const matchRef = doc(db, 'matches', matchId);
      const winner = team1Score > team2Score ? 'team1' : 
                    team2Score > team1Score ? 'team2' : null;
                    
      await updateDoc(matchRef, {
        'teams.team1.score': team1Score,
        'teams.team2.score': team2Score,
        winner,
        status: 'completed',
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error updating match result:', error);
      throw error;
    }
  };