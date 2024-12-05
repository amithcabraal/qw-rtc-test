export interface Player {
  id: string;
  name: string;
  score: number;
  isHost: boolean;
  connectionTime?: number;
}

export interface Question {
  id: string;
  text: string;
  answer: string;
}

export interface BuzzResponse {
  playerId: string;
  timestamp: number;
}

export interface GameState {
  players: Player[];
  currentQuestion: Question | null;
  buzzResponses: BuzzResponse[];
  gameStarted: boolean;
  currentAnswerer: string | null;
}