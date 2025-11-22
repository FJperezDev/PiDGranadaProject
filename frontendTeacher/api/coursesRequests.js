import { apiClient } from './api'

export const getSubjects = async () => {
  try {
    // Asumo que tienes un apiClient configurado
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

export const createGroup = async (subjectId, name_es, name_en) => {
  try {
    const payload = {
      name_es: name_es,
      name_en: name_en,
    };
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