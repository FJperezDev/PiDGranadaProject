import { apiClient } from './api'

// --- GETTERS ---
export const getSubjects = async () => (await apiClient.get('/subjects/')).data;

export const getSubject = async (subjectId) => (await apiClient.get(`/subjects/${subjectId}/`)).data;

export const getMyGroups = async () => (await apiClient.get('/studentgroups/my-groups/')).data;

export const getOtherGroups = async () => (await apiClient.get('/studentgroups/others-groups/')).data;

export const getSubjectGroups = async (subjectId) => (await apiClient.get(`/subjects/${subjectId}/groups/`)).data;

export const getSubjectTopics = async (subjectId) => (await apiClient.get(`/subjects/${subjectId}/topics/`)).data;


// --- ACCIONES (CREATE / DELETE / UPDATE) ---

// Crear Asignatura
export const createSubject = async (data) => {
    // data: { name_es, name_en, description_es, description_en }
    const response = await apiClient.post(`/subjects/`, data);
    return response.data;
};

// Borrar Asignatura
export const deleteSubject = async (subjectId) => {
    await apiClient.delete(`/subjects/${subjectId}/`);
};

// Crear Grupo
export const createGroup = async (subjectId, data) => {
    // data: { name_es, name_en }
    const response = await apiClient.post(`/subjects/${subjectId}/groups/`, data);
    return response.data;
};

// Borrar Grupo
export const deleteGroup = async (groupId) => {
  try {
    // Atacamos directamente al ViewSet de StudentGroups
    await apiClient.delete(`/studentgroups/${groupId}/`);
  } catch (error) {
    console.error("Error deleting group:", error.response?.data || error.message);
    throw error;
  }
};

// Reordenar Temas
export const swapTopicOrder = async (subjectId, topicA_Title, topicB_Title) => {
    const response = await apiClient.put(`/subjects/${subjectId}/topics/`, {
      topicA: topicA_Title,
      topicB: topicB_Title
    });
    return response.data;
};