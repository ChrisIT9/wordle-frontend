import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { LoginComponent } from './Components/Login';
import { RegisterComponent } from './Components/Register';
import { Provider } from 'react-redux';
import store from './Store/User';
import { GamesComponent } from './Components/Games';
import { GameLobbyComponent } from './Components/GameLobbyComponent';

ReactDOM.render(
	<React.StrictMode>
		<Provider store={store}>
			<BrowserRouter>
				<Routes>
					<Route path='*' element={<App />} />
					<Route path='login' element={<LoginComponent />} />
					<Route path='register' element={<RegisterComponent />} />
					<Route path='/games' element={<GamesComponent />} />
					<Route path='/games/:gameId/lobby' element={<GameLobbyComponent />} />
				</Routes>
			</BrowserRouter>
		</Provider>
	</React.StrictMode>,
	document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
