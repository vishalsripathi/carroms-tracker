
export interface MatchScore {
  team1Score: number;
  team2Score: number;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface TeamData {
  players: string[];
  score: number;
}

export interface MatchTeams {
  team1: TeamData;
  team2: TeamData;
}