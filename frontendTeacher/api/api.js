import axios from 'axios';
import { getLanguage } from '../context/LanguageContext';

export const apiClient = axios.create({
    baseURL: 'http://localhost:8000/',
    // baseURL: 'http://10.76.38.52:8000',
  timeout: 10000,
  // baseURL: 'http://localhost:8081/',
});

apiClient.interceptors.request.use(
  (config) => {
    config.headers['Accept-Language'] = getLanguage();
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
