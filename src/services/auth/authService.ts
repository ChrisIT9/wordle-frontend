import type { UserCredentials } from '@/types/auth/UserCredentials';
import type { Token } from '@/types/auth/Token';
import router from '@/router';
import { noAuthPost } from '../httpService';

export const register = async (registrationData: UserCredentials) => {
  return noAuthPost<UserCredentials, Token>(
    `${import.meta.env.VITE_API_URL}/auth/signup`,
    registrationData
  );
};

export const login = async (loginData: UserCredentials) => {
  return await noAuthPost<UserCredentials, Token>(
    `${import.meta.env.VITE_API_URL}/auth/signin`,
    loginData
  );
};

export const logout = () => {
  localStorage.clear();
  router.push({ name: 'login' });
};
