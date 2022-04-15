import { Board } from "./Misc";

export interface User {
	username: string;
	password: string;
	isAdmin: boolean;
}

export interface Game {
	gameId: string;
	players: string[];
	gameStatus: GameStatus;
	winner: string | undefined;
	word: string;
	moves: string[];
	host: string;
}

export enum GameStatus {
  HAS_TO_START = 'HAS TO START',
  IN_PROGRESS = 'IN PROGRESS',
  WON = 'WON',
  TIED = 'TIED'
}

export interface HistoryGame {
	gameId: string,
	opponent: string,
	wordToFind: string,
	gameResult: 'WON' | 'TIED' | 'LOST',
	playerGuesses: Board,
	opponentGuesses: Board,
	date: string | undefined
} 