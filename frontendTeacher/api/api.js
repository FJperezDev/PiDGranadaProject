import axios from 'axios';

export const instance = axios.create({
  baseURL: 'http://172.25.28.130:8000/',
  timeout: 10000,
  // baseURL: 'http://localhost:8081/',
});