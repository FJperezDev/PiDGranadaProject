import axios from 'axios';

export const instance = axios.create({
  baseURL: 'http://192.168.1.131:8000/',
  timeout: 10000,
  // baseURL: 'http://localhost:8081/',
});