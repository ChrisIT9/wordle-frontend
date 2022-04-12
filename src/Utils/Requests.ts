export const getDefaultPostOptions = () => {
	return {
		method: 'POST',
		mode: 'cors' as RequestMode,
		credentials: 'include' as RequestCredentials,
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
		} as HeadersInit,
	};
};

export const getDefaultGetOptions = () => {
	return {
		mode: 'cors' as RequestMode,
		credentials: 'include' as RequestCredentials,
	};
};
