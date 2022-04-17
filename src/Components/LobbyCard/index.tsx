import {
	Alert,
	Box,
	Button,
	Card,
	CardActions,
	CardContent,
	Modal,
	Snackbar,
	TextField,
	Typography,
} from '@mui/material';
import { FC, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Game } from '../../Typings/Entitities';
import { getDefaultPostOptions } from '../../Utils/Requests';
import { backendEndpoint } from '../Environment';
import LockIcon from '@mui/icons-material/Lock';
import './index.css';
import { passwordModalStyle } from '../../Utils/Game';

export const LobbyCard: FC<{ game: Game }> = props => {
	const { game } = props;
	const [joinError, setJoinError] = useState(false);
	const [joinErrorMessage, setJoinErrorMessage] = useState(
		undefined as string | undefined
	);
	const [password, setPassword] = useState(undefined as string | undefined);
	const passwordRef = useRef<string | undefined>();
	passwordRef.current = password;
	const [joinLobbyModal, setJoinLobbyModal] = useState(false);
	const navigate = useNavigate();

	const joinLobby = async (gameId: string) => {
		if (game.password && !passwordRef.current) {
			setJoinError(true);
			setJoinErrorMessage('Fornire una password!');
			return;
		}
		setJoinError(false);
		setJoinErrorMessage(undefined);
		try {
			const response = await fetch(
				`${backendEndpoint}/games/${gameId}/players`,
				{
					...getDefaultPostOptions(),
					body: new URLSearchParams({
						password: password || '',
					}).toString(),
					method: 'PATCH',
				}
			);
			const { game, message } = (await response.json()) as {
				game?: Game;
				message?: string;
				errors?: string[];
			};
			if (game) {
				setJoinError(false);
				setJoinLobbyModal(false);
				navigate(`/games/${gameId}/lobby`);
			} else {
				setJoinErrorMessage(message);
				setJoinError(true);
			}
		} catch (error) {
			setJoinError(true);
		}
	};

	return (
		<>
			<Modal open={joinLobbyModal}>
				<Box sx={passwordModalStyle}>
					<TextField
						label='Password'
						variant='filled'
						type='password'
						error={joinError}
						helperText={joinErrorMessage}
						sx={{
							input: { color: '#D1DEDE' },
							label: { color: '#D1DEDE', fontWeight: 'bold' },
							backgroundColor: 'rgba(12, 59, 105, 0.35)',
							borderRadius: '5px',
							width: '100%',
						}}
						onChange={event => setPassword(event.target.value)}
						onKeyDown={({ code }) => code === 'Enter' && joinLobby(game.gameId)}
					/>
					<Button
						variant='contained'
						sx={{
							backgroundColor: '#0a5a10',
							borderRadius: '50px',
							marginTop: '10px',
						}}
						onClick={() => {
							joinLobby(game.gameId);
						}}
					>
						Unisciti
					</Button>
					<Button
						variant='contained'
						sx={{
							backgroundColor: '#a30b0b',
							borderRadius: '50px',
							marginTop: '10px',
						}}
						onClick={() => {
							setJoinLobbyModal(false);
							setJoinError(false);
							setJoinErrorMessage(undefined);
						}}
					>
						Annulla
					</Button>
				</Box>
			</Modal>
			<Snackbar
				open={joinError}
				autoHideDuration={2000}
				onClose={() => setJoinError(false)}
			>
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
					backgroundColor: 'rgba(0, 0, 0, 0.6)',
					borderRadius: '15px',
				}}
			>
				<CardContent>
					<Typography
						sx={{
							fontSize: 14,
						}}
						color='#d1dede'
						gutterBottom
					>
						<span
							style={{
								display: 'flex',
								flexFlow: 'row nowrap',
								justifyContent: 'flex-start',
								alignItems: 'center',
							}}
						>
							<span>
								ID: <b>{game.gameId}</b>{' '}
							</span>
							<LockIcon
								sx={{
									display: game.password ? 'inline-block' : 'none',
									marginLeft: '5px',
								}}
							></LockIcon>
						</span>
					</Typography>
					<Typography variant='h5' component='div' color='#d1dede'>
						Lobby di <b>{game.host}</b>
					</Typography>
					<Typography color='#d1dede'>
						Giocatori: <b>{game.players.length}/2</b>
					</Typography>
				</CardContent>
				<CardActions>
					<Button
						sx={{ fontWeight: 'bold', color: '#d1dede', borderRadius: '50px' }}
						variant='contained'
						size='small'
						onClick={() =>
							game.password ? setJoinLobbyModal(true) : joinLobby(game.gameId)
						}
					>
						Entra nella lobby
					</Button>
				</CardActions>
			</Card>
		</>
	);
};
