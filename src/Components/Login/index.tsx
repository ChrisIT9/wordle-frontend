import { Alert, Button, TextField } from '@mui/material';
import { FC, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { addUsername, clearUsername } from '../../Store/User/User.actions';
import { LoginResponse, MeResponse } from '../../Typings/Responses';
import { getDefaultGetOptions, getDefaultPostOptions } from '../../Utils/Requests';
import { backendEndpoint } from '../Environment';
import CircularProgress from '@mui/material/CircularProgress';
import './index.css';

export const LoginComponent: FC = () => {
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const [providedUsername, setUsername] = useState(
		undefined as string | undefined
	);
	const [providedPassword, setPassword] = useState(
		undefined as string | undefined
	);
	const [usernameError, setUsernameError] = useState(
		undefined as string | undefined
	);
	const [passwordError, setPasswordError] = useState(
		undefined as string | undefined
	);
	const [waitingForResponse, setWaitingForResponse] = useState(false);
	const [serverUnreachable, setServerUnreachable] = useState(false);
	const [hasLoggedIn, setHasLoggedIn] = useState(false);

	const checkMe = async () => {
		try {
			const response = await fetch(`${backendEndpoint}/auth/me`, {
				...getDefaultGetOptions()
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

	const login = async () => {
		setUsernameError(undefined);
		setPasswordError(undefined);
		setServerUnreachable(false);
		if (!providedUsername || !providedPassword) {
			!providedUsername && setUsernameError('Inserisci uno username!');
			!providedPassword && setPasswordError('Inserisci una password!');
			return;
		}
		setWaitingForResponse(true);
		try {
			const response = await fetch(`${backendEndpoint}/auth/login`, {
				...getDefaultPostOptions(),
				body: new URLSearchParams({
					username: providedUsername,
					password: providedPassword,
				}).toString(),
			});
			const { errors, username } = (await response.json()) as LoginResponse;
			if (errors) {
				const [error] = errors;
				error.toLowerCase().includes('username') && setUsernameError(error);
				error.toLowerCase().includes('password') && setPasswordError(error);
			} else if (username) {
				dispatch(addUsername(username));
				setHasLoggedIn(true);
				setTimeout(navigate, 1000, '/games');
			}
			setWaitingForResponse(false);
		} catch (error) {
			setServerUnreachable(true);
			setWaitingForResponse(false);
			dispatch(clearUsername());
		}
	};

	return (
		<div className='loginContainer'>
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
				sx={{ fontWeight: 'bold', display: hasLoggedIn ? 'flex' : 'none' }}
			>
				Hai effettuato l'accesso - reindirizzo alla home
			</Alert>
			<h1>Effettua l'accesso</h1>
			<div className='login'>
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
						code === 'Enter' && login();
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
						code === 'Enter' && login();
					}}
					error={!!passwordError}
					helperText={passwordError}
				/>
				<Button variant='contained' sx={{ width: '100%', borderRadius: '50px', marginBottom: '25px' }} onClick={login}>
					{waitingForResponse ? <CircularProgress sx={{ color: 'white' }}/> : 'Accedi'}
				</Button>
				Non sei ancora un utente?
				<Button variant='contained' sx={{ width: '100%', borderRadius: '50px', marginTop: '5px', backgroundColor: '#0a5a10' }} onClick={() => navigate('/register')}>
					Registrati
				</Button>
			</div>
		</div>
	);
};
