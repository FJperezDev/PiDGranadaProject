import axios from 'axios';
import { getLanguage } from '../context/LanguageContext';
import adapter from 'axios/lib/adapters/xhr';

export const apiClient = axios.create({
  baseURL: 'https://api.franjpg.com',
  // baseURL: 'http://192.168.0.66:8000',
  headers: {
    'Content-Type': 'application/json',
  },
  adapter: adapter,
});


// Interceptor para agregar el header de idioma en cada solicitud
apiClient.interceptors.request.use(
  (config) => {
    config.headers['Accept-Language'] = getLanguage();
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
