import { Alert, Button, CircularProgress, Snackbar } from '@mui/material';
import { FC, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { addUsername, clearUsername } from '../../Store/User/User.actions';
import { Game } from '../../Typings/Entitites';
import { MeResponse } from '../../Typings/Responses';
import { getDefaultGetOptions, getDefaultPostOptions } from '../../Utils/Requests';
import { backendEndpoint } from '../Environment';
import { LobbyCard } from '../LobbyCard';
import RefreshIcon from '@mui/icons-material/Refresh';
import './index.css';

export const GamesComponent: FC = () => {
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const [lobbies, setLobbies] = useState([] as Game[]);
	const [serverUnreachable, setServerUnreachable] = useState(false);
	const [waitingForResponse, setWaitingForResponse] = useState(false);
	const [lobbyCreationError, setLobbyCreationError] = useState(false);

  const createLobby = async () => {
    const response = await fetch(`${backendEndpoint}/games`, {
      ...getDefaultPostOptions()
    });
    const { game } = await response.json() as { game?: Game, errors?: string[] }
    if (game) {
      navigate(`/games/${game.gameId}/lobby`);
    } else {
      setLobbyCreationError(true);
    }
  };

	const fetchLobbies = async () => {
		setWaitingForResponse(true);
		try {
			const response = await fetch(`${backendEndpoint}/games`, {
				...getDefaultGetOptions(),
			});
			const body = (await response.json()) as Game[];
			setLobbies(body);
			setWaitingForResponse(false);
		} catch (error) {
			setServerUnreachable(true);
			dispatch(clearUsername());
			setWaitingForResponse(false);
		}
	};

	const checkMe = async () => {
		try {
			const response = await fetch(`${backendEndpoint}/auth/me`, {
				...getDefaultGetOptions(),
			});
			const { username } = (await response.json()) as MeResponse;
			if (response.status === 200) {
				username && dispatch(addUsername(username));
				fetchLobbies();
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
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<div className='gamesContainer'>
			<h1>LOBBY APERTE</h1>
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
			<Snackbar
				open={lobbyCreationError}
				autoHideDuration={6000}
				onClose={() => {
					setLobbyCreationError(false);
				}}
			>
				<Alert severity='error' sx={{ width: '100%', fontWeight: 'bold' }}>
					Si è verificato un errore durante la creazione della lobby!
				</Alert>
			</Snackbar>
			<div className='gamesNavbar'>
				<Button
					variant='contained'
					sx={{
						alignSelf: 'end',
						backgroundColor: '#0a5a10',
						display: serverUnreachable ? 'none' : 'flex',
						borderRadius: '50px',
					}}
          onClick={createLobby}
				>
					Crea partita
				</Button>
        <Button
					variant='contained'
					sx={{
						alignSelf: 'end',
						backgroundColor: '#0a5a10',
						display: serverUnreachable ? 'none' : 'flex',
						borderRadius: '50px',
            marginLeft: '5px'
					}}
          onClick={fetchLobbies}
				>
					<RefreshIcon sx={{ color: 'white' }}></RefreshIcon>
				</Button>
			</div>
			<div className='games'>
				<CircularProgress
					sx={{
						color: 'white',
						display: waitingForResponse ? 'block' : 'none',
					}}
				/>
				{lobbies.length ? (
					lobbies.map(lobby => (
						<LobbyCard game={lobby} key={lobby.gameId}></LobbyCard>
					))
				) : serverUnreachable ? (
					<h2>Il server non è raggiungibile.</h2>
				) : (
					<h2>Nessuno ha ancora creato una partita, sii il primo!</h2>
				)}
			</div>
		</div>
	);
};
