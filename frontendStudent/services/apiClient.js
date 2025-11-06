import axios from 'axios';

export const apiClient = axios.create({
  baseURL: 'http://192.168.1.131:8000', // o la IP de tu PC si estás en emulador o dispositivo real
  headers: {
    'Content-Type': 'application/json',
  },
});