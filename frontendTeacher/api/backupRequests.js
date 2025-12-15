import { apiClient } from './api'; // Asegúrate de que esta ruta a tu instancia de Axios es correcta
import { Platform } from 'react-native';

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

// POST: Insertar datos iniciales (borrara los anteriores)
export const importContentFromExcel = async (fileUri, fileName, fileType) => {
    const formData = new FormData();
    
    // Preparar el archivo para FormData (compatible con React Native y Web)
    if (Platform.OS === 'web') {
        // En web, fileUri suele ser el objeto File directamente o un Blob
        formData.append('file', fileUri); 
    } else {
        // En móvil
        formData.append('file', {
            uri: fileUri,
            name: fileName || 'import.xlsx',
            type: fileType || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
    }

    const response = await apiClient.post('/backups/import-content/', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};