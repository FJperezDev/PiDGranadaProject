import axios from 'axios';
import { getLanguage } from '../context/LanguageContext';

export const apiClient = axios.create({
  baseURL: 'http://localhost:8000', // o la IP de tu PC si estás en emulador o dispositivo real
  headers: {
    'Content-Type': 'application/json',
  },
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