import { FC, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import { backendEndpoint, socketEndpoint } from '../Environment';
import { getDefaultGetOptions } from '../../Utils/Requests';
import { MeResponse } from '../../Typings/Responses';
import { useDispatch } from 'react-redux';
import { addUsername, clearUsername } from '../../Store/User/User.actions';
import './index.css';
import { Game } from '../../Typings/Entitites';
import { Alert } from '@mui/material';

export const GameLobbyComponent: FC = () => {
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const { gameId: receivedGameId } = useParams();
	const [serverUnreachable, setServerUnreachable] = useState(false);
	const [socket, setSocket] = useState(undefined as undefined | Socket);
	const [isHost, setIsHost] = useState(false);
	const [gameIdAndUser, setGameIdAndUser] = useState({
		user: undefined as string | undefined,
		gameId: undefined as string | undefined,
	});
	const [lobbyError, setLobbyError] = useState(false);
  const [lobbyErrorMessage, setLobbyErrorMessage] = useState(undefined as string | undefined);

	window.addEventListener('popstate', () => {
		if (socket?.connected) socket?.disconnect();
	});

	const checkLobby = async (user: string) => {
		setLobbyError(false);
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
		const { game, isHost: isGameHost, errors } = (await response.json()) as {
			errors?: string[];
			game?: Game;
			isHost?: boolean;
		};
		if (game && isGameHost != null) {
			setGameIdAndUser({ gameId: game.gameId, user });
			setIsHost(isGameHost);
		} else if (errors) {
      const [error] = errors;
			setLobbyError(true);
      setLobbyErrorMessage(error || 'Impossibile connettersi alla lobby!');
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
		socket?.close();
		const newSocket = io(`${socketEndpoint}/games/${gameId}`, {
			transports: ['websocket'],
			query: {
				user,
				gameId,
			},
			forceNew: true,
		});
		/* if (newSocket?.io.opts.query) {
			newSocket.io.opts.query = {
				...newSocket.io.opts.query,
				gameId: gameIdAndUser.gameId,
			};
		} */ // keeping this in case i need to force the query params for the socket manager 
		setSocket(newSocket);
	};

	const checkMe = async () => {
		try {
			const response = await fetch(`${backendEndpoint}/auth/me`, {
				...getDefaultGetOptions(),
			});
			const { username } = (await response.json()) as MeResponse;
			if (response.status === 200) {
				username && dispatch(addUsername(username)) && checkLobby(username);
			} else {
				dispatch(clearUsername());
				navigate('/login');
			}
		} catch (error) {
			setServerUnreachable(true);
			dispatch(clearUsername());
		}
	};

	useEffect(() => {
		checkMe();
		return () => {
			socket?.disconnect(); // fired when component is unmounted
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
			  {lobbyErrorMessage} - aggiorna la pagina o{' '}
				<Link to='/games'>torna alla home</Link>!
			</Alert>
			<h1>{gameIdAndUser.gameId}</h1>
		</>
	);
};
