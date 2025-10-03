export interface User {
  id: string;
  name: string;
  color: string;
  createdAt: Date;
}

export interface Game {
  id: string;
  name: string;
  players: User[];
  scores: { [userId: string]: number };
  scoreLines?: { [lineId: string]: { [userId: string]: number | null } };
  gameGoal: 'highest' | 'lowest';
  scoreLimit: number | null;
  createdAt: Date;
}

export interface ScoreEntry {
  userId: string;
  userName: string;
  score: number;
  color: string;
}
