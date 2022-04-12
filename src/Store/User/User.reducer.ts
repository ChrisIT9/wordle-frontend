import { createReducer } from '@reduxjs/toolkit';
import { addUsername, clearUsername } from './User.actions';

export const userReducer = createReducer(
	{ username: undefined as string | undefined, isLoggedIn: false },
	builder => {
		builder.addCase(addUsername, (_, action) => ({
			username: action.payload,
			isLoggedIn: true,
		}));
		builder.addCase(clearUsername, (_, __) => ({
			username: undefined,
			isLoggedIn: false,
		}));
	}
);
