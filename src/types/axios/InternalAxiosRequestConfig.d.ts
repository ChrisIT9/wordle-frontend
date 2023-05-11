import type { InternalAxiosRequestConfig } from 'axios';

declare module 'axios' {
  // Extends InternalAxiosRequestConfig interface
  export interface InternalAxiosRequestConfig {
    refresh?: boolean; //true if the refresh token request was sent
  }
};
