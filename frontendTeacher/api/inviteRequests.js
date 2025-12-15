import { apiClient } from './api';

// 1. Obtener todos los usuarios (GET /users/)
export const getUsers = async () => {
  try {
    const res = await apiClient.get('/users/');
    return res.data;
  } catch (error) {
    console.error('Error getting users:', error.response?.data || error);
    throw error;
  }
};

// 2. Crear/Invitar un usuario (POST /users/)
export const createUser = async (userData) => {
  try {
    // userData debe contener: { username, email, password, is_super }
    const res = await apiClient.post('/users/invite/', userData);
    return res.data;
  } catch (error) {
    // Captura el error para que ManageUsersScreen lo maneje
    console.error('Error creating user:', error.response?.data || error);
    throw error;
  }
};

// 3. Borrar un usuario (DELETE /users/{id})
export const deleteUser = async (userId) => {
    try {
        // DELETE espera un status 204 No Content
        await apiClient.delete(`/users/${userId}/`);
        return { success: true };
    } catch (error) {
        console.error('Error deleting user:', error.response?.data || error);
        throw error;
    }
};