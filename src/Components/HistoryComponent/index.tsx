import {
	Accordion,
	AccordionDetails,
	AccordionSummary,
	Alert,
	Button,
	CircularProgress,
	Typography,
} from '@mui/material';
import { FC, memo, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { addUsername, clearUsername } from '../../Store/User/User.actions';
import { HistoryGame } from '../../Typings/Entitities';
import { HistoryResponse, MeResponse } from '../../Typings/Responses';
import { getDefaultGetOptions } from '../../Utils/Requests';
import { MemoizedBoard } from '../BoardComponent';
import { backendEndpoint } from '../Environment';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import './index.css';
import { getTranslatedResult } from '../../Utils/Game';
import { formatDate, getTrimmedWord } from '../../Utils/Misc';
import { userSelector } from '../../Store/User/User.selector';
import SportsEsportsRoundedIcon from '@mui/icons-material/SportsEsportsRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import PercentRoundedIcon from '@mui/icons-material/PercentRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';

const HistoryComponent: FC = () => {
	const [games, setGames] = useState([] as HistoryGame[]);
	const [serverUnreachable, setServerUnreachable] = useState(false);
	const [gamesWon, setGamesWon] = useState(0);
	const [gamesPlayed, setGamesPlayed] = useState(0);
	const [waitingForResponse, setWaitingForResponse] = useState(false);
	const { username } = useSelector(userSelector);
	const dispatch = useDispatch();
	const navigate = useNavigate();

	const getHistory = async () => {
		setWaitingForResponse(true);
		try {
			const response = await fetch(`${backendEndpoint}/users/me/history`, {
				...getDefaultGetOptions(),
			});
			const body = (await response.json()) as HistoryResponse;
			setGames(body.games);
			setGamesWon(body.gamesWon);
			setGamesPlayed(body.gamesPlayed);
			setWaitingForResponse(false);
		} catch (error) {
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
				username && dispatch(addUsername(username)) && getHistory();
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
	}, []);

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
			<div
				className='gameHistoryContainer'
				style={{ display: serverUnreachable ? 'none' : 'flex' }}
			>
				<div className='playerSummary'>
					<Button
						variant='contained'
						sx={{
							position: 'absolute',
							top: '10px',
							left: '10px',
							borderRadius: '20px',
						}}
						onClick={() => navigate('/games')}
					>
						<ArrowBackRoundedIcon></ArrowBackRoundedIcon>
					</Button>
					<CircularProgress
						sx={{
							color: 'white',
							display: waitingForResponse ? 'block' : 'none',
							margin: '5px',
						}}
					/>
					<h1 style={{ marginTop: '35px' }}>
						Statistiche per <i>{username}</i>
					</h1>
					<div className='statistic'>
						<SportsEsportsRoundedIcon
							sx={{ marginRight: '5px' }}
						></SportsEsportsRoundedIcon>{' '}
						<span>
							Partite giocate: <b>{gamesPlayed}</b>
						</span>
					</div>
					<div className='statistic'>
						<CheckCircleRoundedIcon
							sx={{ marginRight: '5px' }}
						></CheckCircleRoundedIcon>{' '}
						<span>
							Partite vinte: <b>{gamesWon}</b>
						</span>
					</div>
					<div className='statistic'>
						<PercentRoundedIcon
							sx={{ marginRight: '5px' }}
						></PercentRoundedIcon>{' '}
						<span>
							Percentuale di vittoria:{' '}
							<b>
								{gamesPlayed > 0 ? `${Math.round((gamesWon / gamesPlayed) * 100)}%` : 'N/D'}
							</b>
						</span>
					</div>
				</div>
				<CircularProgress
					sx={{
						color: 'white',
						display: waitingForResponse ? 'block' : 'none',
						margin: '5px',
					}}
				/>
				{games.length > 0 ? (
					games.map(game => {
						return (
							<div className='gameHistoryItem' key={game.gameId}>
								<Accordion
									sx={{
										width: '100%',
										backgroundColor: 'rgba(17, 59, 118, 0.25)',
										color: '#D1DEDE',
										borderRadius: '10px',
									}}
								>
									<AccordionSummary
										expandIcon={<ExpandMoreIcon sx={{ color: '#D1DEDE' }} />}
									>
										<Typography>
											<span className={`result ${game.gameResult}`}>
												{getTranslatedResult(game.gameResult)}
											</span>
											ID: <b>{game.gameId}</b>
											<br />
											Parola: <b>{game.wordToFind.toUpperCase()}</b>
											<br />
											Avversario: <b>{game.opponent}</b> <br />
											Giocata il <i>{formatDate(game.date)}</i>
										</Typography>
									</AccordionSummary>
									<AccordionDetails>
										<div className='historyGameSummary'>
											<div className='historyBoard'>
												<h3>Tu</h3>
												<MemoizedBoard
													miniBoard={true}
													board={game.playerGuesses}
												></MemoizedBoard>
											</div>
											<div className='historyBoard'>
												<h3>{getTrimmedWord(game.opponent)}</h3>
												<MemoizedBoard
													miniBoard={true}
													board={game.opponentGuesses}
												></MemoizedBoard>
											</div>
										</div>
									</AccordionDetails>
								</Accordion>
							</div>
						);
					})
				) : (
					<h1 style={{ textAlign: 'center' }}>Non hai ancora giocato una partita :(</h1>
				)}
			</div>
		</>
	);
};

export const MemoizedHistory = memo(HistoryComponent);
