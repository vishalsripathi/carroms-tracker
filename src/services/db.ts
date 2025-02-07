import { 
    collection, 
    doc, 
    getDocs, 
    getDoc, 
    setDoc, 
    updateDoc, 
    query, 
    orderBy,
    limit,
    Timestamp, 
    Query,
    DocumentData
  } from 'firebase/firestore';
  import { db } from './firebase';
  import type { User, Match } from '../types';

  type ServiceResponse<T> = {
    success: boolean;
    data?: T;
    error?: string;
  };
  
  // User operations
  export const getUser = async (userId: string): Promise<ServiceResponse<User>> => {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (!userDoc.exists()) {
        return {
          success: false,
          error: 'User not found'
        };
      }
      return {
        success: true,
        data: { id: userDoc.id, ...userDoc.data() } as User
      };
    } catch (error) {
      console.error('Error fetching user:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  };
  
  // Match operations
  export const createMatch = async (
    matchData: Omit<Match, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<ServiceResponse<Match>> => {
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
      return {
        success: true,
        data: match
      };
    } catch (error) {
      console.error('Error creating match:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  };
  
  export const getRecentMatches = async (limitCount = 10) => {
    try {
      const matchesRef = collection(db, 'matches');
      const q = query(
        matchesRef,
        orderBy('date', 'desc'),
        limit(limitCount)
      ) as Query<DocumentData>;
      
      const querySnapshot = await getDocs(q);
      const matches = querySnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      })) as Match[];
  
      return {
        success: true,
        data: matches
      };
    } catch (error) {
      console.error('Error fetching recent matches:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  };
  
  // Update match result
  export const updateMatchResult = async (
    matchId: string, 
    team1Score: number, 
    team2Score: number
  ): Promise<ServiceResponse<void>> => {
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
  
      return {
        success: true
      };
    } catch (error) {
      console.error('Error updating match result:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  };