import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { LoginComponent } from './Components/Login';
import { RegisterComponent } from './Components/Register';
import { Provider } from 'react-redux';
import store from './Store/User';
import { GamesComponent } from './Components/Games';
import { GameLobbyComponent } from './Components/GameLobbyComponent';
import { GameComponent } from './Components/GameComponent';
import { createTheme, ThemeProvider } from '@mui/material';
import { MemoizedHistory } from './Components/HistoryComponent';

const theme = createTheme({
	typography: {
		fontFamily: [
			'Ubuntu',
			'-apple-system',
			'BlinkMacSystemFont',
			'"Segoe UI"',
			'Roboto',
			'"Helvetica Neue"',
			'Arial',
			'sans-serif',
			'"Apple Color Emoji"',
			'"Segoe UI Emoji"',
			'"Segoe UI Symbol"',
		].join(','),
	},
});

ReactDOM.render(
	<React.StrictMode>
		<ThemeProvider theme={theme}>
			<Provider store={store}>
				<BrowserRouter>
					<Routes>
						<Route path='*' element={<LoginComponent />} />
						<Route path='/login' element={<LoginComponent />} />
						<Route path='/register' element={<RegisterComponent />} />
						<Route path='/games' element={<GamesComponent />} />
						<Route path='/games/:gameId' element={<GameComponent />} />
						<Route
							path='/games/:gameId/lobby'
							element={<GameLobbyComponent />}
						/>
						<Route
							path='/matchHistory'
							element={<MemoizedHistory />}
						/>
					</Routes>
				</BrowserRouter>
			</Provider>
		</ThemeProvider>
	</React.StrictMode>,
	document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
