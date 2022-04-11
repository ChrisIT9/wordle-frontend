import { Alert, Button, TextField } from '@mui/material';
import { FC, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoginResponse } from '../../Typings/Responses';
import { backendEndpoint } from '../Environment';
import './index.css';

export const LoginComponent: FC = () => {
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
	const [hasLoggedIn, setHasLoggedIn] = useState(false);
	const navigate = useNavigate();

	useEffect(() => {
		checkMe();
	}, []);

	const checkMe = async () => {
		const response = await fetch(`${backendEndpoint}/auth/me`, {
			mode: 'cors',
			credentials: 'include',
		});
		if (response.status === 200) navigate('/games');
	};

	const login = async () => {
		setUsernameError(undefined);
		setPasswordError(undefined);
		const response = await fetch(`${backendEndpoint}/auth/login`, {
			method: 'POST',
			mode: 'cors',
			credentials: 'include',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
			},
			body: `username=${providedUsername}&password=${providedPassword}`,
		});
		const { errors, username, isAdmin } =
			(await response.json()) as LoginResponse;
		if (errors) {
			const [error] = errors;
			error.includes('Username') && setUsernameError(error);
			error.includes('Password') && setPasswordError(error);
		} else if (username) {
			setHasLoggedIn(true);
      setTimeout(navigate, 1500, '/games');
		}
	};

	return (
		<div className='loginContainer'>
			<Alert
				severity='success'
				sx={{ fontWeight: 'bold', display: hasLoggedIn ? 'flex' : 'none' }}
			>
				Hai effettuato l'accesso - reindirizzo alla home
			</Alert>
			<h1>Effettua l'accesso</h1>
			<div className='login'>
				<TextField
					id='filled-basic'
					required
					color='info'
					label='Username'
					variant='filled'
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
					id='filled-basic'
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
				<Button variant='contained' sx={{ width: '100%' }} onClick={login}>
					Accedi
				</Button>
			</div>
		</div>
	);
};
