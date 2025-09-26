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
  createdAt: Date;
}

export interface ScoreEntry {
  userId: string;
  userName: string;
  score: number;
  color: string;
}
