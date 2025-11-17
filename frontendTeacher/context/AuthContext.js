import React, { createContext, useEffect, useState } from 'react';
import { login as authLogin, logout as authLogout, logoutAll as authLogoutAll, restoreSession, getLoggedUserInfo, getUsersList } from '../api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [loggedUser, setLoggedUser] = useState({});
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [users, setUsers] = useState([]);

  const checkSession = async () => {
    const success = await restoreSession();
    setIsAuthenticated(success);
    setLoading(false);
  };

  const login = async (email, password) => {
    
    await authLogin(email, password);
    setIsAuthenticated(true);
    setLoading(false);
    
  };

  const logout = async () => {
    await authLogout();
    setIsAuthenticated(false);
    setIsAdmin(false);
    setIsSuperAdmin(false);
    setLoggedUser({});
  };

  const logoutAll = async () => {
    await authLogoutAll();
    setIsAdmin(false);
    setIsSuperAdmin(false);
    setIsAuthenticated(false);
    setLoggedUser({});
    logout();
  };

  const onRefresh = async () => {
    try {
      setRefreshing(true);
      // User profile
      const profile = await getLoggedUserInfo();
      const isAdminNow = profile['role'] !== 'user'
      const isSuperAdminNow = profile['role'] === 'superadmin'
      setLoggedUser(profile);
      setIsAuthenticated(true);
      setIsAdmin(isAdminNow);
      setIsSuperAdmin(isSuperAdminNow);
      if(isAdminNow)
        setUsers(await getUsersList());
      else
        setUsers([])
    } catch (err) {
      console.warn("Error refreshing users:", err);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    checkSession();
  }, []);

  return (
    <AuthContext.Provider value={{ login, logout, logoutAll, isAuthenticated, isAdmin, isSuperAdmin, setLoggedUser, loggedUser, onRefresh, refreshing, users }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
