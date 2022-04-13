import {
	Alert,
	Button,
	Card,
	CardActions,
	CardContent,
	Snackbar,
	Typography,
} from '@mui/material';
import { FC, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Game } from '../../Typings/Entitities';
import { getDefaultPostOptions } from '../../Utils/Requests';
import { backendEndpoint } from '../Environment';
import './index.css';

export const LobbyCard: FC<{ game: Game }> = props => {
	const { game } = props;
  const [joinError, setJoinError] = useState(false);
	const navigate = useNavigate();

	const joinLobby = async (gameId: string) => {
		try {
			const response = await fetch(
				`${backendEndpoint}/games/${gameId}/players`,
				{
					...getDefaultPostOptions(),
					method: 'PATCH',
				}
			);
			const { game } = (await response.json()) as {
				game?: Game;
				message?: string;
				errors?: string[];
			};
			if (game) {
        setJoinError(false);
				navigate(`/games/${gameId}/lobby`);
			} else {
				setJoinError(true);
			}
		} catch (error) {
			setJoinError(true);
		}
	};

	return (
		<>
			<Snackbar open={joinError} autoHideDuration={6000} onClose={() => setJoinError(false)}>
				<Alert severity='error' sx={{ width: '100%', fontWeight: 'bold' }}>
					Si è verificato un errore durante l'accesso alla lobby!
				</Alert>
			</Snackbar>
			<Card
				variant='outlined'
				sx={{
					width: '100%',
					minHeight: 175,
					marginTop: 1.25,
					marginBottom: 1.25,
					textAlign: 'start',
				}}
			>
				<CardContent>
					<Typography sx={{ fontSize: 14 }} color='text.secondary' gutterBottom>
						ID: <b>{game.gameId}</b>
					</Typography>
					<Typography variant='h5' component='div'>
						Proprietario: <b>{game.host}</b>
					</Typography>
					<Typography color='text.secondary'>
						Giocatori: <b>{game.players.length}/2</b>
					</Typography>
				</CardContent>
				<CardActions>
					<Button
						sx={{ fontWeight: 'bold' }}
						size='small'
						onClick={() => joinLobby(game.gameId)}
					>
						Entra nella lobby
					</Button>
				</CardActions>
			</Card>
		</>
	);
};
