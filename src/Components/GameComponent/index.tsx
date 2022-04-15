/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable array-callback-return */
/* eslint-disable eqeqeq */
import { Alert, Box, Button, Modal, Snackbar, Typography } from '@mui/material';
import { FC, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import { addUsername, clearUsername } from '../../Store/User/User.actions';
import { userSelector } from '../../Store/User/User.selector';
import { Game } from '../../Typings/Entitities';
import {
	Board,
	KeyboardStatus,
	LetterPosition,
	SocketEvent,
} from '../../Typings/Misc';
import { MeResponse } from '../../Typings/Responses';
import {
	allowedKeys,
	generateEmptyBoard,
	generateKeyboardStatus,
	resultModalStyle,
} from '../../Utils/Game';
import {
	getDefaultGetOptions,
	getDefaultPostOptions,
} from '../../Utils/Requests';
import { MemoizedBoard } from '../BoardComponent';
import { backendEndpoint, socketEndpoint } from '../Environment';
import { MemoizedKeyboard } from '../KeyboardComponent';
import HomeIcon from '@mui/icons-material/Home';
import './index.css';

export const GameComponent: FC = () => {
	const [serverUnreachable, setServerUnreachable] = useState(false);
	const [socket, setSocket] = useState(undefined as Socket | undefined);
	const socketRef = useRef<Socket | undefined>();
	socketRef.current = socket;
	const [gameIdAndUser, setGameIdAndUser] = useState({
		user: undefined as string | undefined,
		gameId: undefined as string | undefined,
	});
	const [gameJoinError, setGameJoinError] = useState(false);
	const [gameJoinErrorMessage, setGameJoinErrorMessage] = useState(
		undefined as string | undefined
	);
	const [playerMoves, setPlayerMoves] = useState(0);
	const playerMovesRef = useRef<number>();
	playerMovesRef.current = playerMoves;
	const [opponentMoves, setOpponentMoves] = useState(0);
	const opponentMovesRef = useRef<number>();
	opponentMovesRef.current = opponentMoves;
	const [playerBoard, setPlayerBoard] = useState(generateEmptyBoard());
	const playerBoardRef = useRef<Board>();
	playerBoardRef.current = playerBoard;
	const [opponentBoard, setOpponentBoard] = useState(generateEmptyBoard());
	const opponentBoardRef = useRef<Board>();
	opponentBoardRef.current = opponentBoard;
	const [currentWord, setCurrentWord] = useState('');
	const currentWordRef = useRef<string>();
	currentWordRef.current = currentWord;
	const [invalidWord, setInvalidWord] = useState(false);
	const [gameIsOver, setGameIsOver] = useState(false);
	const [gameResult, setGameResult] = useState(undefined as string | undefined);
	const [correctWord, setCorrectWord] = useState(
		undefined as string | undefined
	);
	const [keyboardStatus, setKeyboardStatus] = useState(
		generateKeyboardStatus()
	);
	const keyboardStatusRef = useRef<KeyboardStatus>();
	keyboardStatusRef.current = keyboardStatus;
	const gameIsOverRef = useRef<boolean>();
	gameIsOverRef.current = gameIsOver;
	const { gameId: receivedGameId } = useParams();
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const { username } = useSelector(userSelector);

	const handlePopState = () => {
		if (socketRef.current?.connected) socketRef.current?.disconnect();
	};

	const sendWord = async () => {
		setInvalidWord(false);
		if (!currentWordRef.current) return;
		try {
			const response = await fetch(
				`${backendEndpoint}/games/${receivedGameId}/moves`,
				{
					...getDefaultPostOptions(),
					method: 'PATCH',
					body: new URLSearchParams({
						word: currentWordRef.current,
					}).toString(),
				}
			);
			if (response.status === 400) {
				setInvalidWord(true);
				return;
			}
			const { board } = (await response.json()) as {
				board: LetterPosition[];
				hasWon: boolean;
			};
			if (board && playerMovesRef.current != undefined) {
				currentWordRef.current.split('').map((letter, index) => {
					if (!keyboardStatusRef.current) return null;
					if (
						keyboardStatusRef.current[letter as 'A'] === LetterPosition.RIGHT ||
						(keyboardStatusRef.current[letter as 'A'] !==
							LetterPosition.EMPTY &&
							board[index] === LetterPosition.MISSING)
					)
						return null;
					setKeyboardStatus({
						...keyboardStatusRef.current,
						[letter as 'A']: board[index],
					});
				});
				setPlayerBoard({
					...playerBoardRef.current,
					[playerMovesRef.current]: {
						word: currentWordRef.current,
						letterPositions: board,
					},
				});
				setCurrentWord('');
				setPlayerMoves(playerMovesRef.current + 1);
			}
		} catch (error) {
			// error handling
		}
	};

	const checkMe = async () => {
		try {
			const response = await fetch(`${backendEndpoint}/auth/me`, {
				...getDefaultGetOptions(),
			});
			const { username } = (await response.json()) as MeResponse;
			if (response.status === 200) {
				username && dispatch(addUsername(username)) && checkGame(username);
			} else {
				dispatch(clearUsername());
				navigate('/login');
			}
		} catch (error) {
			setServerUnreachable(true);
			dispatch(clearUsername());
		}
	};

	const checkGame = async (user: string) => {
		setGameJoinError(false);
		try {
			const response = await fetch(
				`${backendEndpoint}/games/${receivedGameId}/`,
				{
					...getDefaultGetOptions(),
				}
			);
			if (response.status === 404) {
				setGameJoinError(true);
				setGameJoinErrorMessage('Non esiste nessuna partita per questo ID');
				return;
			}
			const responseBody = (await response.json()) as
				| Game
				| { errors?: string[]; message?: string };
			if (response.status === 200) {
				setGameIdAndUser({ gameId: (responseBody as Game).gameId, user });
			} else {
				setGameJoinError(true);
				if ('errors' in responseBody && responseBody.errors) {
					setGameJoinErrorMessage(responseBody.errors[0]);
				} else if ('message' in responseBody) {
					setGameJoinErrorMessage(responseBody.message);
				}
			}
		} catch (error) {
			setGameJoinError(true);
			setGameJoinErrorMessage('Il server non è raggiungibile!');
		}
	};

	const createSocket = ({
		gameId,
		user,
	}: {
		gameId: string | undefined;
		user: string | undefined;
	}) => {
		if (!gameId || !user) return;
		socketRef.current?.disconnect();
		const newSocket = io(`${socketEndpoint}/games/${gameId}`, {
			transports: ['websocket'],
			query: {
				user,
				gameId,
			},
			forceNew: true,
		});
		newSocket.on(
			SocketEvent.GAME_MOVES,
			(payload: { user: string; board: LetterPosition[] }) => {
				if (username === payload.user || opponentMovesRef.current === undefined)
					return;
				setOpponentBoard({
					...opponentBoardRef.current,
					[opponentMovesRef.current]: {
						word: undefined,
						letterPositions: payload.board,
					},
				});
				setOpponentMoves(opponentMovesRef.current + 1);
			}
		);
		newSocket.on(SocketEvent.SOCKET_CONFLICT, () => {
			setGameJoinError(true);
			setGameJoinErrorMessage(`Sei già connesso a questa partita`);
		});
		newSocket.on(
			SocketEvent.GAME_ENDED,
			({
				result,
				winner,
				word,
			}: {
				result: 'WON' | 'TIED';
				winner?: string;
				word?: string;
			}) => {
				setGameIsOver(true);
				if (result === 'TIED') {
					setGameResult('Pareggio.');
					setCorrectWord(word);
				} else if (result === 'WON') {
					if (winner === username) {
						setGameResult('Hai vinto!');
					} else {
						setGameResult('Hai perso.');
						setCorrectWord(word);
					}
				}
			}
		);
		setSocket(newSocket);
	};

	const handleKeyPress = (event: KeyboardEvent) => {
		if (playerMovesRef.current === 6 || gameIsOverRef.current) return;
		if (event.code === 'Space') event.preventDefault();
		if (event.code === 'Backspace' && currentWordRef.current) {
			const [, ...newWord] = currentWordRef.current.split('').reverse(); // wtf
			setCurrentWord(newWord.reverse().join('')); // wtf
		}
		// prettier-ignore
		if (event.code === 'Enter' &&	currentWordRef.current && currentWordRef.current.length === 5) {
			sendWord();
		}
		// prettier-ignore
		if (allowedKeys.includes(event.code) && (!currentWordRef.current || currentWordRef.current.length < 5)) {
			setCurrentWord(currentWordRef.current + event.code.replace('Key', ''));
		}
	};

	useEffect(() => {
		checkMe();
		window.addEventListener('keydown', handleKeyPress);
		window.addEventListener('popstate', handlePopState);
		return () => {
			socketRef.current?.disconnect(); // fired when component is unmounted
			window.removeEventListener('keydown', handleKeyPress);
			window.removeEventListener('popstate', handlePopState);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		createSocket(gameIdAndUser!);
	}, [gameIdAndUser]);

	useEffect(() => {
		socket?.connect();
	}, [socket]);

	return (
		<>
			<Button
				variant='contained'
				className='homeButton'
				sx={{ borderRadius: '50px', display: gameJoinError ? 'none' : 'flex' }}
				onClick={() => {
					socket?.disconnect();
					navigate('/games');
				}}
			>
				<HomeIcon></HomeIcon>
			</Button>
			<Alert
				severity='error'
				sx={{
					fontWeight: 'bold',
					display: serverUnreachable ? 'flex' : 'none',
					marginBottom: 5,
				}}
			>
				Il server non è raggiungibile - riprova!
			</Alert>
			<Alert
				severity='error'
				sx={{
					fontWeight: 'bold',
					display: gameJoinError ? 'flex' : 'none',
					marginBottom: 5,
					marginTop: '10px',
				}}
			>
				{gameJoinErrorMessage} - <Link to='/games'>torna alla home</Link>
			</Alert>
			<Snackbar
				open={invalidWord}
				autoHideDuration={500}
				onClose={() => setInvalidWord(false)}
				id='wordError'
			>
				<Alert severity='error' sx={{ width: '100%', fontWeight: 'bold' }}>
					Parola non valida.
				</Alert>
			</Snackbar>
			<Modal
				open={gameIsOver}
				aria-labelledby='modal-modal-title'
				aria-describedby='modal-modal-description'
			>
				<Box sx={resultModalStyle}>
					<Typography id='modal-modal-title' variant='h6' component='h2'>
						{gameResult}
					</Typography>
					<Typography id='modal-modal-description' sx={{ mt: 2 }}>
						{correctWord ? (
							<span>
								La parola era <b>{correctWord}</b>.
							</span>
						) : (
							<span>
								Hai indovinato la parola in <b>{playerMoves}</b> tentativi.
							</span>
						)}
						<br />
						<Link to='/games'>
							<Button
								variant='contained'
								sx={{ marginTop: '10px', borderRadius: '50px' }}
							>
								Torna alla home
							</Button>
						</Link>
					</Typography>
				</Box>
			</Modal>
			<div
				className='gameContainer'
				style={{ display: gameJoinError ? 'none' : 'flex' }}
			>
				<div className='boardContainer' id='playerBoard'>
					<h3>Tu</h3>
					<MemoizedBoard
						board={playerBoard}
						currentWord={currentWord}
						currentIndex={playerMoves}
					></MemoizedBoard>
					<div className='keyboardContainer'>
						<MemoizedKeyboard
							keyboardStatus={keyboardStatus}
							onClickFn={event =>
								handleKeyPress({ code: event } as KeyboardEvent)
							}
						></MemoizedKeyboard>
					</div>
				</div>
				<div
					className='boardContainer'
					style={{ marginBottom: '15px' }}
					id='opponentBoard'
				>
					<h3>Avversario</h3>
					<MemoizedBoard board={opponentBoard} miniBoard={true}></MemoizedBoard>
				</div>
			</div>
		</>
	);
};
