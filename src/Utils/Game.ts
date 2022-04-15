import { Board, KeyboardStatus, LetterPosition } from '../Typings/Misc';

export const allowedKeys = [
	'KeyQ',
	'KeyW',
	'KeyE',
	'KeyR',
	'KeyT',
	'KeyY',
	'KeyU',
	'KeyI',
	'KeyO',
	'KeyP',
	'KeyA',
	'KeyS',
	'KeyD',
	'KeyF',
	'KeyG',
	'KeyH',
	'KeyJ',
	'KeyK',
	'KeyL',
	'KeyZ',
	'KeyX',
	'KeyC',
	'KeyV',
	'KeyB',
	'KeyN',
	'KeyM',
];

export const generateEmptyBoard = (): Board => {
	const board: Board = {};
	const defaultLetterPositions: LetterPosition[] = [];
	for (let x = 0; x < 5; x++) defaultLetterPositions[x] = LetterPosition.EMPTY;
	for (let i = 0; i < 6; i++) {
		board[i] = {
			word: undefined,
			letterPositions: defaultLetterPositions,
		};
	}
	return board;
};

export const generateKeyboardStatus = (): KeyboardStatus => {
	return {
		Q: LetterPosition.EMPTY,
		W: LetterPosition.EMPTY,
		E: LetterPosition.EMPTY,
		R: LetterPosition.EMPTY,
		T: LetterPosition.EMPTY,
		Y: LetterPosition.EMPTY,
		U: LetterPosition.EMPTY,
		I: LetterPosition.EMPTY,
		O: LetterPosition.EMPTY,
		P: LetterPosition.EMPTY,
		A: LetterPosition.EMPTY,
		S: LetterPosition.EMPTY,
		D: LetterPosition.EMPTY,
		F: LetterPosition.EMPTY,
		G: LetterPosition.EMPTY,
		H: LetterPosition.EMPTY,
		J: LetterPosition.EMPTY,
		K: LetterPosition.EMPTY,
		L: LetterPosition.EMPTY,
		Z: LetterPosition.EMPTY,
		X: LetterPosition.EMPTY,
		C: LetterPosition.EMPTY,
		V: LetterPosition.EMPTY,
		B: LetterPosition.EMPTY,
		N: LetterPosition.EMPTY,
		M: LetterPosition.EMPTY,
	};
};

export const getTranslatedResult = (result: 'WON' | 'TIED' | 'LOST') => {
	switch(result) {
		case 'WON':
			return 'Vittoria';
		case 'TIED':
			return 'Pareggio';
		case 'LOST':
			return 'Sconfitta'
		default:
			return result;
	}
}

export const resultModalStyle = {
	position: 'absolute' as 'absolute',
	top: '50%',
	left: '50%',
	transform: 'translate(-50%, -50%)',
	width: 350,
	bgcolor: '#121213',
	border: '2px solid #000',
	boxShadow: 24,
	p: 4,
	borderRadius: '10px',
	outline: 0,
};
