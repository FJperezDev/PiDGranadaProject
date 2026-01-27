import { apiClient } from './api';

// Obtener usuarios
export const getUsers = async () => {
    const res = await apiClient.get('/users/');
    return res.data;
};

// Crear/Invitar usuario
export const createUser = async (userData) => {
    // userData: { username, email, password, is_super }
    // IMPORTANTE: No usamos try-catch aquí. Dejamos que falle para que el componente
    // pueda leer error.response.data y mostrar "El usuario ya existe" o "Email inválido".
    const res = await apiClient.post('/users/invite/', userData);
    return res.data;
};

// Borrar usuario
export const deleteUser = async (userId) => {
    await apiClient.delete(`/users/${userId}/`);
    return { success: true };
};