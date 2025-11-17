import React, { createContext, useEffect, useState } from 'react';
import { login as authLogin, logout as authLogout, restoreSession, getLoggedUserInfo } from '../api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [loggedUser, setLoggedUser] = useState({});
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSuper, setIsSuper] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const checkSession = async () => {
    const success = await restoreSession();
    setIsAuthenticated(success);
    setLoading(false);
    if(loggedUser.is_super){
      setIsSuper(true);
    } else {
      setIsSuper(false);
    }
  };

  const login = async (email, password) => {
    await authLogin(email, password);
    setLoading(false);
    setIsAuthenticated(true);
    await onRefresh();
  };

  const logout = async () => {
    await authLogout();
    setIsAuthenticated(false);
    setLoggedUser({});
    setIsSuper(false);
  };

  const onRefresh = async () => {
    try {
      setRefreshing(true);
      // User profile
      const profile = await getLoggedUserInfo();
      const isSuperNow = profile.is_super
      setLoggedUser(profile);
      setIsAuthenticated(true);
      setIsSuper(isSuperNow);
    } catch (err) {
      console.warn("Error getting loggedUserInfo:", err);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    checkSession();
  }, []);

  return (
    <AuthContext.Provider value={{ login, logout, isAuthenticated, setLoggedUser, loggedUser, onRefresh, refreshing, isSuper }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
