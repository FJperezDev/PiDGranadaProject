import { apiClient } from './api'

export const getLoggedUserInfo = async () => {
    try{
        const res = await apiClient.get("/account/profile/");
        return res.data;
    }catch(err){
        console.error("Error fetching logged user data: ", err);
        return null;
    }
}

export const changePassword = async (oldPassword, newPassword) => {
    try {
        const res = await apiClient.put("/change-password/", {
            old_password: oldPassword,
            new_password: newPassword
        });
        
        return { success: true, data: res.data };
        
    } catch (err) {
        // CASO 1: El servidor respondió (ej: 400 Bad Request - Contraseña común)
        if (err.response && err.response.data) {
            return { success: false, error: err.response.data };
        }
        
        // CASO 2: No hay respuesta del servidor (Sin internet o servidor caído)
        if (err.request) {
            return { success: false, error: { detail: "No hay conexión con el servidor." } };
        }

        // CASO 3: Error desconocido
        return { success: false, error: { detail: "Ocurrió un error inesperado." } };
    }
};
