import { Alert, Button, TextField } from '@mui/material';
import { FC, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { addUsername, clearUsername } from '../../Store/User/User.actions';
import { RegisterResponse, MeResponse } from '../../Typings/Responses';
import {
	getDefaultGetOptions,
	getDefaultPostOptions,
} from '../../Utils/Requests';
import { backendEndpoint } from '../Environment';
import CircularProgress from '@mui/material/CircularProgress';
import './index.css';

export const RegisterComponent: FC = () => {
	const [providedUsername, setUsername] = useState(
		undefined as string | undefined
	);
	const [providedPassword, setPassword] = useState(
		undefined as string | undefined
	);
	const [providedPasswordConfirmation, setProvidedPasswordConfirmation] =
		useState(undefined as string | undefined);
	const [usernameError, setUsernameError] = useState(
		undefined as string | undefined
	);
	const [passwordError, setPasswordError] = useState(
		undefined as string | undefined
	);
	const [passwordConfirmationError, setPasswordConfirmationError] = useState(
		undefined as string | undefined
	);
	const [serverUnreachable, setServerUnreachable] = useState(false);
	const [hasSignedUp, setHasSignedUp] = useState(false);
	const [waitingForResponse, setWaitingForResponse] = useState(false);
	const dispatch = useDispatch();
	const navigate = useNavigate();

	const checkMe = async () => {
		try {
			const response = await fetch(`${backendEndpoint}/auth/me`, {
				...getDefaultGetOptions(),
			});
			const { username } = (await response.json()) as MeResponse;
			if (response.status === 200) {
				username && dispatch(addUsername(username));
				navigate('/games');
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

	const register = async () => {
		try {
			setUsernameError(undefined);
			setPasswordError(undefined);
			setPasswordConfirmationError(undefined);
			setServerUnreachable(false);
			// prettier-ignore
			if (!providedUsername || !providedPassword || !providedPasswordConfirmation) {
				!providedUsername && setUsernameError('Inserisci uno username!');
				!providedPassword && setPasswordError('Inserisci una password!');
				!providedPasswordConfirmation && setPasswordConfirmationError('Inserisci una password'); 
				return;
			}
			setWaitingForResponse(true);
			const response = await fetch(`${backendEndpoint}/auth/register`, {
				...getDefaultPostOptions(),
				body: new URLSearchParams({
					password: providedPassword,
					passwordConfirmation: providedPasswordConfirmation,
					username: providedUsername,
				}).toString(),
			});
			const { username, errors } = (await response.json()) as RegisterResponse;
			if (errors) {
				const [error] = errors;
				// prettier-ignore
				(error.toLowerCase().includes('nome utente') || error.toLowerCase().includes('username')) && setUsernameError(error);
				error.toLowerCase().includes('password') && setPasswordError(error);
				error.toLowerCase().includes('password') &&
					setPasswordConfirmationError(error);
			} else if (username) {
				setHasSignedUp(true);
				setTimeout(navigate, 1000, '/login');
			}
			setWaitingForResponse(false);
		} catch (error) {
			setServerUnreachable(true);
			setWaitingForResponse(false);
			dispatch(clearUsername());
		}
	};

	return (
		<div className='registerContainer'>
			<Alert
				severity='error'
				sx={{
					fontWeight: 'bold',
					display: serverUnreachable ? 'flex' : 'none',
				}}
			>
				Il server non è raggiungibile - riprova!
			</Alert>
			<Alert
				severity='success'
				sx={{ fontWeight: 'bold', display: hasSignedUp ? 'flex' : 'none' }}
			>
				Ti sei registrato correttamente - reindirizzo alla pagina di login
			</Alert>
			<h1>Registrati</h1>
			<div className='register'>
				<TextField
					id='username'
					required
					color='info'
					label='Username'
					variant='filled'
					autoComplete='off'
					inputProps={{ maxLength: 20 }}
					sx={{
						marginBottom: 2.5,
						input: { color: 'white' },
						label: { color: 'white', fontWeight: 'bold' },
					}}
					onChange={({ target: { value } }) => {
						setUsername(value);
					}}
					onKeyDown={({ code }) => {
						code === 'Enter' && register();
					}}
					error={!!usernameError}
					helperText={usernameError}
				/>
				<TextField
					id='password'
					type='password'
					required
					label='Password'
					variant='filled'
					sx={{
						input: { color: 'white' },
						label: { color: 'white', fontWeight: 'bold' },
						marginBottom: 2.5,
					}}
					onChange={({ target: { value } }) => {
						setPassword(value);
					}}
					onKeyDown={({ code }) => {
						code === 'Enter' && register();
					}}
					error={!!passwordError}
					helperText={passwordError}
				/>
				<TextField
					id='passwordConfirmation'
					type='password'
					required
					label='Conferma password'
					variant='filled'
					sx={{
						input: { color: 'white' },
						label: { color: 'white', fontWeight: 'bold' },
						marginBottom: 2.5,
					}}
					onChange={({ target: { value } }) => {
						setProvidedPasswordConfirmation(value);
					}}
					onKeyDown={({ code }) => {
						code === 'Enter' && register();
					}}
					error={!!passwordConfirmationError}
					helperText={passwordConfirmationError}
				/>
				<Button
					variant='contained'
					sx={{ width: '100%', borderRadius: '50px', marginBottom: '25px' }}
					onClick={register}
				>
					{waitingForResponse ? (
						<CircularProgress sx={{ color: 'white' }} />
					) : (
						'Registrati'
					)}
				</Button>
				Sei già un utente?
				<Button
					variant='contained'
					sx={{
						width: '100%',
						borderRadius: '50px',
						marginTop: '5px',
						backgroundColor: '#0a5a10',
					}}
					onClick={() => navigate('/login')}
				>
					Accedi
				</Button>
			</div>
		</div>
	);
};
