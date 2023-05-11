import axios, {
  AxiosError,
  type AxiosRequestConfig,
  type AxiosResponse
} from 'axios';
import type { Token } from '@/types/auth/Token';
import { HttpErrorResponse } from '@/types/errors/HttpErrorResponse';
import { NoAuthError } from '@/types/errors/NoAuthError';
import { logout } from './auth/authService';
import { getToken, memoizedRefreshToken } from './auth/tokenService';

const handleAxiosError = (error: AxiosError | unknown) => {
  //check the error
  if (axios.isAxiosError(error) && error.response) {
    throw new HttpErrorResponse(error.response.data, error.response.status);
  } else {
    throw error;
  }
};

/* No-Auth Requests
-----------------------------------------------------------------------------*/
// Set errors handling
axios.interceptors.response.use(
  /*success*/ (response) => response,
  /*error*/ handleAxiosError
);

export const noAuthGet = <R>(
  url: string,
  config?: AxiosRequestConfig
): Promise<AxiosResponse<R>> => axios.get(url, config);

export const noAuthPost = <B, R>(
  url: string,
  body: B,
  config?: AxiosRequestConfig
): Promise<AxiosResponse<R>> => axios.post(url, body, config);
//-----------------------------------------------------------------------------

// Axios custom instance (authentication needed)
export const authHttp = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    Accept: 'application/json'
  }
});
/* Setting up interceptors */
//-request
authHttp.interceptors.request.use(
  async (config) => {
    const currentSession = getToken();
    if (!currentSession) {
      logout();
      throw new NoAuthError();
    }

    const authData = <Token>JSON.parse(currentSession);

    if (authData?.accessToken) {
      config.headers.Authorization = `Bearer ${authData?.accessToken}`;
    }

    return config;
  },
  (error) => {
    throw error;
  }
);
//-response
authHttp.interceptors.response.use(
  (response) => response, //return response
  async (error: AxiosError) => {
    //In case of error
    const { config } = error;

    // Handle expired token
    if (error.response?.status === 401 && config && !config.refresh) {
      config.refresh = true;

      const tokenResponse = await memoizedRefreshToken();

      if (tokenResponse?.accessToken && config) {
        config.headers.Authorization = `Bearer ${tokenResponse?.accessToken}`;

        delete config.refresh; //remove refresh prop for the next expiration
      }

      return authHttp(config);
    }

    handleAxiosError(error);
  }
);
