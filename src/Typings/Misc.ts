export enum SocketEvent {
	PLAYER_CONNECTED = 'PLAYER_CONNECTED',
	PLAYER_DISCONNECTED = 'PLAYER_DISCONNECTED',
	HOST_DISCONNECTED = 'HOST_DISCONNECTED',
	GAME_STARTED = 'GAME_STARTED',
	GAME_ENDED = 'GAME_ENDED',
	GAME_MOVES = 'GAME_MOVES',
	SOCKET_CONFLICT = 'SOCKET_CONFLICT'
}

export interface Board {
	[key: number]: {
		word: string | undefined,
		letterPositions: LetterPosition[]
	}
}

export enum LetterPosition {
	MISSING = 'WRONG',
	RIGHT = 'RIGHT',
	WRONG_POSITION = 'WRONG POSITION',
	EMPTY = 'EMPTY'
}

export interface KeyboardStatus {
	Q: LetterPosition,
	W: LetterPosition,
	E: LetterPosition,
	R: LetterPosition,
	T: LetterPosition,
	Y: LetterPosition,
	U: LetterPosition,
	I: LetterPosition,
	O: LetterPosition,
	P: LetterPosition,
	A: LetterPosition,
	S: LetterPosition,
	D: LetterPosition,
	F: LetterPosition,
	G: LetterPosition,
	H: LetterPosition,
	J: LetterPosition,
	K: LetterPosition,
	L: LetterPosition,
	Z: LetterPosition,
	X: LetterPosition,
	C: LetterPosition,
	V: LetterPosition,
	B: LetterPosition,
	N: LetterPosition,
	M: LetterPosition,
}