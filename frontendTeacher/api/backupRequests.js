import { apiClient } from './api'; // Asegúrate de que esta ruta a tu instancia de Axios es correcta

// GET: Listar
export const getBackups = async () => {
    const response = await apiClient.get('/backups/');
    return response.data;
};

// POST: Generar (Crear)
export const generateBackup = async () => {
    const response = await apiClient.post('/backups/');
    return response.data;
};

// DELETE: Borrar
export const deleteBackup = async (id) => {
    const response = await apiClient.delete(`/backups/${id}/`);
    return response.data;
};

// POST: Restaurar (Action personalizada)
export const restoreBackup = async (id) => {
    const response = await apiClient.post(`/backups/${id}/restore/`);
    return response.data;
};