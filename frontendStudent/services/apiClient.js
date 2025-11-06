import axios from 'axios';

export const apiClient = axios.create({
  baseURL: 'http://172.25.28.130:8000', // o la IP de tu PC si estás en emulador o dispositivo real
  headers: {
    'Content-Type': 'application/json',
  },
});