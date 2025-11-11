
import { setRefreshToken, getRefreshToken, setAccessToken, getAccessToken, deleteRefreshToken,  } from '../utils/memory';
import { instance } from './api'

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// Authorization interceptor
instance.interceptors.request.use(
  async config => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// Response interceptor: 401 code errors refreshing token
instance.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes('/token/refresh/') &&
      !originalRequest.url.includes('/login/') &&
      !originalRequest.url.includes('/logout/')
    ) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers['Authorization'] = 'Bearer ' + token;
            return instance(originalRequest);
          })
          .catch(err => Promise.reject(err));
      }

      isRefreshing = true;

      try {
        const refresh = await getRefreshToken();
        const res = await instance.post('/token/refresh/', { refresh });
        const newAccess = res.data.access;
        if (res.data.refresh) {
          await setRefreshToken(res.data.refresh);
        }

        setAccessToken(newAccess);
        processQueue(null, newAccess);

        originalRequest.headers.Authorization = `Bearer ${newAccess}`;
        return instance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        logout();
        Alert.alert("Expired Session", "Try login again.");
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export const login = async (email, password) => {
  try {
    const res = await instance.post("/login/", { email, password });
    const { access, refresh } = res.data;

    if (!access || !refresh) throw new Error("Tokens not arrived");

    setAccessToken(access);
    await setRefreshToken(refresh);
    console.log("Login succesful");
  } catch (error) {
    console.warn("Login error:", error.response?.data || error.message);
    throw error;
  }
};

export const logout = async () => {
  console.log("Logout succesful");
  await deleteRefreshToken("refresh");
  setAccessToken(null);
  await instance.post("/logout/");
};

export const logoutAll = async () => {
  console.log("Logout from all devices");
  await deleteRefreshToken("refresh");
  setAccessToken(null);
  await instance.post("/logout_all/");
};

export const register = async (data) => {
  try {
    const res = await instance.post("/register/", data);
    return res.data;
  } catch (err) {
    console.warn("Register error:", err.response?.data || err.message);
    throw err;
  }
};

export const refreshAccessToken = async () => {
  try {
    
    const refresh = await getRefreshToken();
    if (!refresh) throw new Error("No refresh token saved");
    
    const res = await instance.post("/token/refresh/", { refresh });
    const newAccess = res.data.access;
    if (res.data.refresh) {
      await setRefreshToken(res.data.refresh); 
    }
    if (!newAccess) throw new Error("Access token not received");

    setAccessToken(newAccess);
    return newAccess;
  } catch (err) {
    console.warn(
      "Refreshing access token error:",
      err.response?.data || err.message
    );
    throw err;
  }
};

export const restoreSession = async () => {
  try {
    await refreshAccessToken(); // si falla, se atrapará
    return true;
  } catch (err) {
    console.warn("Couldn't restore session", err);
    return false;
  }
};
