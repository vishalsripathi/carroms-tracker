// services/matchService.ts
import { 
  collection, 
  doc, 
  updateDoc, 
  Timestamp,
  getDoc,
  arrayUnion,
  DocumentReference 
} from 'firebase/firestore';
import { db } from './firebase';
import { Match } from '../types/match';

interface MatchScores {
  team1Score: number;
  team2Score: number;
}


class MatchService {
  private matchesCollection = collection(db, 'matches');

  async getMatch(matchId: string): Promise<Match> {
    const matchRef = doc(this.matchesCollection, matchId);
    const matchDoc = await getDoc(matchRef);
    
    if (!matchDoc.exists()) {
      throw new Error('Match not found');
    }
  
    const data = matchDoc.data();
    return {
      id: matchDoc.id,
      ...data,
      date: data.date.toDate(),
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate(),
      history: data.history.map((event: any) => ({
        ...event,
        timestamp: event.timestamp.toDate()
      }))
    } as Match;
  }

  async rescheduleMatch(
    matchId: string,
    newDate: Date,
    userId: string,
    userName: string
): Promise<void> {
    const matchRef = doc(this.matchesCollection, matchId);
    const matchDoc = await getDoc(matchRef);
    
    if (!matchDoc.exists()) {
        throw new Error('Match not found');
    }

    // Set the time to noon UTC to avoid timezone issues
    const normalizedDate = new Date(Date.UTC(
        newDate.getFullYear(),
        newDate.getMonth(),
        newDate.getDate(),
        12, 0, 0
    ));
    
    await updateDoc(matchRef, {
        date: Timestamp.fromDate(normalizedDate),
        updatedAt: Timestamp.now(),
        history: arrayUnion({
            type: 'reschedule',
            timestamp: Timestamp.now(),
            userId,
            userName,
            data: {
                oldDate: matchDoc.data().date,
                newDate: Timestamp.fromDate(normalizedDate)
            }
        })
    });
}

  async deleteMatch(
    matchId: string,
    userId: string,
    userName: string,
    reason?: string
  ): Promise<void> {
    const matchRef = doc(this.matchesCollection, matchId);
    const matchDoc = await getDoc(matchRef);
    
    if (!matchDoc.exists()) {
      throw new Error('Match not found');
    }

    const updateEvent = {
      type: 'deletion',
      timestamp: new Date(),
      userId,
      userName,
      data: {
        reason
      }
    };

    await updateDoc(matchRef, {
      status: 'cancelled',
      updatedAt: Timestamp.now(),
      history: arrayUnion(updateEvent)
    });
  }

  async addComment(
    matchId: string,
    comment: {
      text: string;
      userId: string;
      userName: string;
    }
  ): Promise<void> {
    const matchRef = doc(this.matchesCollection, matchId);
    const matchDoc = await getDoc(matchRef);
    
    if (!matchDoc.exists()) {
      throw new Error('Match not found');
    }
  
    const commentEvent = {
      type: 'comment',
      timestamp: new Date(),
      userId: comment.userId,
      userName: comment.userName,
      data: {
        text: comment.text
      }
    };
  
    await updateDoc(matchRef, {
      updatedAt: Timestamp.now(),
      history: arrayUnion(commentEvent)
    });
  }

  validateScores(team1Score: number, team2Score: number): boolean {
    if (team1Score < 0 || team2Score < 0) return false;
    if (team1Score > 29 || team2Score > 29) return false;
    return true;
  }

  determineWinner(team1Score: number, team2Score: number): 'team1' | 'team2' | null {
    if (team1Score === team2Score) return null;
    return team1Score > team2Score ? 'team1' : 'team2';
  }

  startMatch(matchId: string, userId: string, userName: string): Promise<void> {
    const matchRef = doc(this.matchesCollection, matchId);
    return this.updateMatchStatus(matchRef, 'scheduled', 'in_progress', userId, userName);
  }

  updateMatchScore(
    matchId: string, 
    scores: MatchScores,
    userId: string,
    userName: string
  ): Promise<void> {
    const { team1Score, team2Score } = scores;
    
    if (!this.validateScores(team1Score, team2Score)) {
      return Promise.reject(new Error('Invalid scores provided'));
    }

    const matchRef = doc(this.matchesCollection, matchId);
    return this.updateScores(matchRef, scores, userId, userName);
  }

  completeMatch(
    matchId: string,
    finalScores: MatchScores,
    userId: string,
    userName: string
  ): Promise<void> {
    const { team1Score, team2Score } = finalScores;
    
    if (!this.validateScores(team1Score, team2Score)) {
      return Promise.reject(new Error('Invalid scores for match completion'));
    }

    if (team1Score === team2Score) {
      return Promise.reject(new Error('Match cannot end in a tie'));
    }

    const matchRef = doc(this.matchesCollection, matchId);
    return this.completeMatchWithScores(matchRef, finalScores, userId, userName);
  }

  editCompletedMatch(
    matchId: string,
    scores: MatchScores,
    userId: string,
    userName: string
  ): Promise<void> {
    const { team1Score, team2Score } = scores;
    
    if (!this.validateScores(team1Score, team2Score)) {
      return Promise.reject(new Error('Invalid scores provided'));
    }

    if (team1Score === team2Score) {
      return Promise.reject(new Error('Match cannot end in a tie'));
    }

    const matchRef = doc(this.matchesCollection, matchId);
    return this.editMatchScores(matchRef, scores, userId, userName);
  }

  substitutePlayer(
    matchId: string,
    team: 'team1' | 'team2',
    oldPlayerId: string,
    newPlayerId: string,
    userId: string,
    userName: string
  ): Promise<void> {
    const matchRef = doc(this.matchesCollection, matchId);
    return this.performSubstitution(matchRef, team, oldPlayerId, newPlayerId, userId, userName);
  }

  private async updateMatchStatus(
    matchRef: DocumentReference,
    fromStatus: string,
    toStatus: string,
    userId: string,
    userName: string
  ): Promise<void> {
    const matchDoc = await getDoc(matchRef);
    
    if (!matchDoc.exists()) {
      throw new Error('Match not found');
    }

    const matchData = matchDoc.data();
    if (matchData.status !== fromStatus) {
      throw new Error(`Match cannot be updated - invalid status`);
    }

    const updateEvent = {
      type: 'status_change',
      timestamp: new Date(),
      userId,
      userName,
      data: { oldStatus: fromStatus, newStatus: toStatus }
    };

    await updateDoc(matchRef, {
      status: toStatus,
      updatedAt: Timestamp.now(),
      history: arrayUnion(updateEvent)
    });
  }

  private async updateScores(
    matchRef: DocumentReference,
    scores: MatchScores,
    userId: string,
    userName: string
  ): Promise<void> {
    const matchDoc = await getDoc(matchRef);
    
    if (!matchDoc.exists()) {
      throw new Error('Match not found');
    }

    const matchData = matchDoc.data();
    if (matchData.status !== 'in_progress') {
      throw new Error('Can only update scores for in-progress matches');
    }

    const updateEvent = {
      type: 'score_update',
      timestamp: new Date(),
      userId,
      userName,
      data: {
        oldScores: {
          team1: matchData.teams.team1.score,
          team2: matchData.teams.team2.score
        },
        newScores: scores
      }
    };

    await updateDoc(matchRef, {
      'teams.team1.score': scores.team1Score,
      'teams.team2.score': scores.team2Score,
      updatedAt: Timestamp.now(),
      history: arrayUnion(updateEvent)
    });
  }

  private async completeMatchWithScores(
    matchRef: DocumentReference,
    scores: MatchScores,
    userId: string,
    userName: string
  ): Promise<void> {
    const matchDoc = await getDoc(matchRef);
    
    if (!matchDoc.exists()) {
      throw new Error('Match not found');
    }

    const matchData = matchDoc.data();
    if (matchData.status !== 'in_progress') {
      throw new Error('Only in-progress matches can be completed');
    }

    const winner = this.determineWinner(scores.team1Score, scores.team2Score);
    const updateEvent = {
      type: 'match_edit',
      timestamp: new Date(),
      userId,
      userName,
      data: {
        status: 'completed',
        finalScores: scores,
        winner
      }
    };

    await updateDoc(matchRef, {
      'teams.team1.score': scores.team1Score,
      'teams.team2.score': scores.team2Score,
      status: 'completed',
      winner,
      updatedAt: Timestamp.now(),
      completedAt: Timestamp.now(),
      history: arrayUnion(updateEvent)
    });
  }

  private async editMatchScores(
    matchRef: DocumentReference,
    scores: MatchScores,
    userId: string,
    userName: string
): Promise<void> {
    const matchDoc = await getDoc(matchRef);
    if (!matchDoc.exists()) throw new Error('Match not found');

    const matchData = matchDoc.data();
    const winner = this.determineWinner(scores.team1Score, scores.team2Score);
    
    const updateEvent = {
        type: 'score_update',  // Changed from match_edit
        timestamp: Timestamp.now(),
        userId,
        userName,
        data: {
            oldScores: {
                team1: matchData.teams.team1.score,
                team2: matchData.teams.team2.score
            },
            newScores: scores
        }
    };

    await updateDoc(matchRef, {
        'teams.team1.score': scores.team1Score,
        'teams.team2.score': scores.team2Score,
        winner,
        updatedAt: Timestamp.now(),
        history: arrayUnion(updateEvent)
    });
}

  private async performSubstitution(
    matchRef: DocumentReference,
    team: 'team1' | 'team2',
    oldPlayerId: string,
    newPlayerId: string,
    userId: string,
    userName: string
  ): Promise<void> {
    const matchDoc = await getDoc(matchRef);
    
    if (!matchDoc.exists()) {
      throw new Error('Match not found');
    }

    const matchData = matchDoc.data();
    if (matchData.status === 'scheduled') {
      throw new Error('Cannot substitute players in a scheduled match');
    }

    const currentPlayers = matchData.teams[team].players;
    const playerIndex = currentPlayers.indexOf(oldPlayerId);
    
    if (playerIndex === -1) {
      throw new Error('Player not found in the team');
    }

    const newPlayers = [...currentPlayers];
    newPlayers[playerIndex] = newPlayerId;

    const updateEvent = {
      type: 'substitution',
      timestamp: new Date(),
      userId,
      userName,
      data: {
        team,
        oldPlayerId,
        newPlayerId
      }
    };

    await updateDoc(matchRef, {
      [`teams.${team}.players`]: newPlayers,
      updatedAt: Timestamp.now(),
      history: arrayUnion(updateEvent)
    });
  }
}

export const matchService = new MatchService();