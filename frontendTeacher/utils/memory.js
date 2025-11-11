import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

let accessToken = null;

export const setAccessToken = (token) => {
  accessToken = token;
};

export const getAccessToken = () => accessToken;

export const getRefreshToken = () => getItem('refresh');

export const setRefreshToken = (refresh) => saveItem('refresh', refresh);

export const deleteRefreshToken = () => deleteItem('refresh');

export const saveItem = async (key, value) => {
  if (Platform.OS === 'web') {
    localStorage.setItem(key, value);
  } else {
    await SecureStore.setItemAsync(key, value);
  }
};

export const getItem = async (key) => {
  if (Platform.OS === 'web') {
    return localStorage.getItem(key);
  } else {
    return await SecureStore.getItemAsync(key);
  }
};

export const deleteItem = async (key) => {
  if (Platform.OS === 'web') {
    localStorage.removeItem(key);
  } else {
    await SecureStore.deleteItemAsync(key);
  }
};