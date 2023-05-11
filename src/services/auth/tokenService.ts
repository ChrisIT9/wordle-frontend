import { noAuthPost } from '../httpService';
import mem from 'mem';
import type { Token } from '@/types/auth/Token';
import { NoAuthError } from '@/types/errors/NoAuthError';

export const getToken = () => localStorage.getItem('auth');

export const setToken = (authData?: Token) => {
  if (authData) {
    localStorage.setItem('auth', JSON.stringify(authData));
  } else localStorage.removeItem('auth');
};

const refreshToken = async () => {
  const currentSession = getToken();
  if (!currentSession) throw new NoAuthError();

  try {
    const newAuthData: Token = (
      await noAuthPost<{}, Token>(
        `${import.meta.env.VITE_API_URL}/auth/token`,
        {},
        {
          headers: {
            authorization: `Bearer ${
              (<Token>JSON.parse(currentSession)).refreshToken
            }`
          }
        }
      )
    ).data;

    if (!newAuthData?.accessToken) {
      //Log out if access token not received
      setToken();
    }

    //Set new access token
    setToken(newAuthData);

    return newAuthData;
  } catch (error) {
    //Log out in case of errors
    localStorage.removeItem('auth');
  }
};

export const memoizedRefreshToken = mem(refreshToken, {
  maxAge: 10000 //cached for 10 seconds
});
