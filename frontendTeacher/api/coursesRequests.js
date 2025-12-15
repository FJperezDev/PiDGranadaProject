import { apiClient } from './api'

// --- Funciones existentes (MANTENER) ---
export const getSubjects = async () => {
  try {
    const response = await apiClient.get('/subjects/');
    return response.data;
  } catch (error) {
    console.error("Error fetching subjects:", error.response?.data || error.message);
    throw error;
  }
};

export const getMyGroups = async () => {
  try {
    const response = await apiClient.get('/studentgroups/my-groups/');
    return response.data;
  } catch (error) {
    console.error("Error fetching my groups:", error.response?.data || error.message);
    throw error;
  }
};

export const getOtherGroups = async () => {
  try {
    const response = await apiClient.get('/studentgroups/others-groups/');
    return response.data;
  } catch (error) {
    console.error("Error fetching others groups:", error.response?.data || error.message);
    throw error;
  }
};

export const createSubject = async (name_es, name_en, description_es, description_en) => {
  try {
    const payload = { name_es, name_en, description_es, description_en};
    const response = await apiClient.post(`/subjects/`, payload);
    return response.data;
  } catch (error) {
    console.error("Error creating subject:", error.response?.data || error.message);
    throw error;
  }
};

export const deleteSubject = async (subjectId) => {
  try {
    await apiClient.delete(`/subjects/${subjectId}/`);
  } catch (error) {
    console.error("Error deleting subject:", error.response?.data || error.message);
    throw error;
  }
};

export const createGroup = async (subjectId, name_es, name_en) => {
  try {
    const payload = { name_es, name_en };
    const response = await apiClient.post(`/subjects/${subjectId}/groups/`, payload);
    return response.data;
  } catch (error) {
    console.error("Error creating group:", error.response?.data || error.message);
    throw error;
  }
};

export const deleteGroup = async (subjectId, groupId) => {
  try {
    await apiClient.delete(`/subjects/${subjectId}/groups/${groupId}/`);
  } catch (error) {
    console.error("Error deleting group:", error.response?.data || error.message);
    throw error;
  }
};

// --- NUEVAS FUNCIONES PARA EL REORDENAMIENTO ---

// Obtener temas de una asignatura
export const getSubjectTopics = async (subjectId) => {
  try {
    const response = await apiClient.get(`/subjects/${subjectId}/topics/`);
    return response.data;
  } catch (error) {
    console.error("Error fetching subject topics:", error.response?.data || error.message);
    throw error;
  }
};

// Intercambiar orden de temas (Swap)
export const swapTopicOrder = async (subjectId, topicA_Title, topicB_Title) => {
  try {
    const response = await apiClient.put(`/subjects/${subjectId}/topics/`, {
      topicA: topicA_Title,
      topicB: topicB_Title
    });
    return response.data;
  } catch (error) {
    console.error("Error swapping topics:", error.response?.data || error.message);
    throw error;
  }
};
