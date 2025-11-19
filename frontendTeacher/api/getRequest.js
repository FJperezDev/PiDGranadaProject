import { instance } from './api'

export const getLoggedUserInfo = async () => {
    try{
        const res = await instance.get("/account/profile/");
        return res.data;
    }catch(err){
        console.error("Error fetching logged user data: ", err);
        return null;
    }
}

export const getUserInfo = async (userId) => {
    try{
        const uri = "/users/" + userId + "/";
        const res = await instance.get(uri);
        return res.data;
    }catch(err){
        console.error("Error fetching user data: ", err);
        return null;
    }
}

export const getUsersList = async () => {
    try {
        const res = await instance.get("/users/");
        return res.data;
    } catch (err) {
        console.error("Error fetching users list: ", err);
        return null;
    }
}

export const getSubjects = async () => {
  try {
    // Asumo que tienes un apiClient configurado
    const response = await instance.get('/subjects/');
    return response.data;
  } catch (error) {
    console.error("Error fetching subjects:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * Obtiene los grupos del profesor autenticado.
 * @returns {Promise<Array>} Lista de grupos.
 */
export const getMyGroups = async () => {
  try {
    const response = await instance.get('/studentgroups/my-groups/');
    return response.data;
  } catch (error) {
    console.error("Error fetching my groups:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * Obtiene TODOS los grupos (solo para SuperTeacher).
 * @returns {Promise<Array>} Lista de todos los grupos.
 */
export const getOtherGroups = async () => {
  try {
    const response = await instance.get('/studentgroups/others-groups/');
    return response.data;
  } catch (error) {
    console.error("Error fetching others groups:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * Crea un nuevo grupo para una asignatura.
 * @param {number} subjectId - El ID de la asignatura.
 * @param {string} name - El nombre del grupo.
 * @returns {Promise<Object>} El grupo recién creado.
 */
export const createGroup = async (subjectId, name) => {
  try {
    // El backend espera name_es y name_en. Enviamos el mismo nombre a ambos.
    const payload = {
      name_es: name,
      name_en: name,
    };
    const response = await instance.post(`/subjects/${subjectId}/groups/`, payload);
    return response.data;
  } catch (error) {
    console.error("Error creating group:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * Elimina un grupo.
 * @param {number} subjectId - El ID de la asignatura del grupo.
 * @param {number} groupId - El ID del grupo a eliminar.
 * @returns {Promise<void>}
 */
export const deleteGroup = async (subjectId, groupId) => {
  try {
    await instance.delete(`/subjects/${subjectId}/groups/${groupId}/`);
  } catch (error) {
    console.error("Error deleting group:", error.response?.data || error.message);
    throw error;
  }
};