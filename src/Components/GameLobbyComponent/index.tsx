/* eslint-disable react-hooks/exhaustive-deps */
import { FC, useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import { backendEndpoint, socketEndpoint } from '../Environment';
import {
	getDefaultGetOptions,
	getDefaultPostOptions,
} from '../../Utils/Requests';
import { MeResponse } from '../../Typings/Responses';
import { useDispatch } from 'react-redux';
import { addUsername, clearUsername } from '../../Store/User/User.actions';
import './index.css';
import { Game } from '../../Typings/Entitities';
import { Alert, Button, Snackbar } from '@mui/material';
import { SocketEvent } from '../../Typings/Misc';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LockIcon from '@mui/icons-material/Lock';
import { CircularProgress } from '@mui/material';

export const GameLobbyComponent: FC = () => {
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const { gameId: receivedGameId } = useParams();
	const [serverUnreachable, setServerUnreachable] = useState(false);
	const [socket, setSocket] = useState(undefined as undefined | Socket);
	const socketRef = useRef<Socket | undefined>();
	socketRef.current = socket;
	const [isHost, setIsHost] = useState(false);
	const [gameHost, setGameHost] = useState(undefined as string | undefined);
	const [gameIdAndUser, setGameIdAndUser] = useState({
		user: undefined as string | undefined,
		gameId: undefined as string | undefined,
	});
	const [lobbyError, setLobbyError] = useState(false);
	const [lobbyErrorMessage, setLobbyErrorMessage] = useState(
		undefined as string | undefined
	);
	const [players, setPlayers] = useState([] as string[]);
	const playersRef = useRef<string[]>();
	playersRef.current = players;
	const [gameStartError, setGameStartError] = useState(false);
	const [isPasswordProtected, setIsPasswordProtected] = useState(false);
	const [waitingForLobby, setWaitingForLobby] = useState(false);

	window.addEventListener('popstate', () => {
		if (socketRef.current?.connected) socketRef.current?.disconnect();
	});

	const checkLobby = async (user: string) => {
		setLobbyError(false);
		setWaitingForLobby(true);
		try {
			const response = await fetch(
				`${backendEndpoint}/games/${receivedGameId}/lobby`,
				{
					...getDefaultGetOptions(),
				}
			);
			if (response.status === 404) {
				setLobbyError(true);
				setLobbyErrorMessage('Non esiste nessuna partita per questo ID');
				return;
			}
			if (response.status === 403) {
				setLobbyError(true);
				setLobbyErrorMessage('Non sei un giocatore di questa partita');
				return;
			}
			const {
				game,
				isHost: isGameHost,
				errors,
			} = (await response.json()) as {
				errors?: string[];
				game?: Game;
				isHost?: boolean;
			};
			if (game && isGameHost != null) {
				setWaitingForLobby(false);
				setPlayers(game.players);
				setIsHost(isGameHost);
				setGameHost(game.host);
				setGameIdAndUser({ gameId: game.gameId, user });
				setIsPasswordProtected(!!game.password);
			} else if (errors) {
				const [error] = errors;
				setWaitingForLobby(false);
				setLobbyError(true);
				setLobbyErrorMessage(error || 'Impossibile connettersi alla lobby!');
			}
		} catch (error) {
			setWaitingForLobby(false);
			setLobbyError(true);
			setLobbyErrorMessage('Il server non è raggiungibile!');
		}
	};

	const startGame = async () => {
		setWaitingForLobby(true);
		setGameStartError(false);
		try {
			const response = await fetch(
				`${backendEndpoint}/games/${receivedGameId}/status`,
				{
					...getDefaultPostOptions(),
					method: 'PUT',
				}
			);
			if (response.status !== 200) {
				setGameStartError(true);
				setWaitingForLobby(false);
			}
		} catch (error) {
			setGameStartError(true);
			setWaitingForLobby(false);
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
		newSocket.on(SocketEvent.PLAYER_CONNECTED, (connectedPlayer: string) => {
			if (!playersRef.current?.includes(connectedPlayer)) {
				setPlayers([...players, connectedPlayer]);
			}
		});
		newSocket.on(
			SocketEvent.PLAYER_DISCONNECTED,
			(disconnectedPlayer: string) => {
				const playerIndex = playersRef.current?.findIndex(
					player => player === disconnectedPlayer
				);
				if (playerIndex != null && playerIndex !== -1) {
					players.splice(playerIndex, 1);
					setPlayers(players);
				}
			}
		);
		newSocket.on(SocketEvent.HOST_DISCONNECTED, () => {
			setLobbyError(true);
			setLobbyErrorMessage(
				`${gameHost} si è disconnesso. La partita è stata annullata`
			);
		});
		newSocket.on(SocketEvent.GAME_STARTED, () => {
			socketRef.current?.disconnect();
			navigate(`/games/${receivedGameId}`);
		});
		newSocket.on(SocketEvent.SOCKET_CONFLICT, () => {
			setLobbyError(true);
			setLobbyErrorMessage(`Sei già connesso a questa partita`);
		});
		setSocket(newSocket);
	};

	const checkMe = async () => {
		setWaitingForLobby(true);
		try {
			const response = await fetch(`${backendEndpoint}/auth/me`, {
				...getDefaultGetOptions(),
			});
			const { username } = (await response.json()) as MeResponse;
			if (response.status === 200) {
				setWaitingForLobby(false);
				username && dispatch(addUsername(username)) && checkLobby(username);
			} else {
				setWaitingForLobby(false);
				dispatch(clearUsername());
				navigate('/login');
			}
		} catch (error) {
			setWaitingForLobby(false);
			setServerUnreachable(true);
			dispatch(clearUsername());
		}
	};

	useEffect(() => {
		checkMe();
		return () => {
			socketRef.current?.disconnect(); // fired when component is unmounted
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
					display: lobbyError ? 'flex' : 'none',
					marginBottom: 5,
					marginTop: '10px',
				}}
			>
				{lobbyErrorMessage} - <Link to='/games'>torna alla home</Link>
			</Alert>
			<Snackbar
				open={gameStartError}
				autoHideDuration={1500}
				onClose={() => setGameStartError(false)}
			>
				<Alert severity='error' sx={{ width: '100%', fontWeight: 'bold' }}>
					Si è verificato un errore durante l'avvio della partita.
				</Alert>
			</Snackbar>
			<div
				className='lobbyScreenContainer'
				style={{
					display: !serverUnreachable && !lobbyError ? 'flex' : 'none',
					textAlign: 'center',
				}}
			>
				<CircularProgress style={{ color: '#D1DEDE', display: waitingForLobby ? 'inline-block' : 'none' }} />
				<div className='lobbyNavbar'>
					<Button
						variant='contained'
						sx={{
							alignSelf: 'start',
							backgroundColor: '#0a5a10',
							borderRadius: '50px',
							display: waitingForLobby ? 'none' : 'flex'
						}}
						onClick={() => {
							socket?.disconnect();
							navigate('/games');
						}}
					>
						<ArrowBackIcon></ArrowBackIcon> 
					</Button>
					<Button
						variant='contained'
						sx={{
							alignSelf: 'end',
							backgroundColor: '#0a5a10',
							display:
								!serverUnreachable && isHost && !lobbyError && !waitingForLobby? 'flex' : 'none',
							borderRadius: '50px',
						}}
						disabled={players.length < 2}
						onClick={startGame}
					>
						Inizia partita
					</Button>
				</div>
				<div className='lobbyScreen' style={{ display: waitingForLobby ? 'none' : 'flex' }}>
					{isPasswordProtected ? <LockIcon sx={{ marginBottom: '5px', marginTop: '5px' }}></LockIcon> : undefined}
					<h2>
						ID: <i>{gameIdAndUser.gameId}</i>
					</h2>
					<h2>Giocatori connessi:</h2>
					{players.map(player => (
						<div className='playerCard' key={player}>
							<span>
								{player}{' '}
								{player === gameHost ? (
									<span
										style={{
											display: 'inline-flex',
											flexFlow: 'row nowrap',
											justifyContent: 'center',
											alignItems: 'center',
										}}
									>
										{' '}
										• (Host)
									</span>
								) : (
									''
								)}
							</span>
						</div>
					))}
				</div>
			</div>
		</>
	);
};
