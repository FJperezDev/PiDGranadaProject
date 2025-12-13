import axios from 'axios';
import { getLanguage } from '../context/LanguageContext';

export const apiClient = axios.create({
  baseURL: 'https://api.franjpg.com/',
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
