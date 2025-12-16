import { apiClient } from './api'

export const getQuestions = async () => {
  try {
    const response = await apiClient.get('/questions/long-questions/');
    return response.data;
  } catch (error) {
    console.error("Error fetching questions:", error);
    throw error;
  }
};

export const createQuestion = async (data) => {
  try {
    // data must have: type, statement_es, statement_en, topics_titles (array), concepts_names (array)
    const response = await apiClient.post('/questions/', data);
    return response.data;
  } catch (error) {
    console.error("Error creating question:", error.response?.data);
    throw error;
  }
};

export const updateQuestion = async (id, data) => {
  try {
    const response = await apiClient.patch(`/questions/${id}/`, data);
    return response.data;
  } catch (error) {
    console.error("Error updating question:", error);
    throw error;
  }
};

export const deleteQuestion = async (id) => {
  try {
    await apiClient.delete(`/questions/${id}/`);
  } catch (error) {
    console.error("Error deleting question:", error);
    throw error;
  }
};

export const getAnswersByQuestion = async (questionId) => {
  try {
    const response = await apiClient.get(`/questions/${questionId}/answers/`);
    return response.data;
  } catch (error) {
    console.error("Error fetching answers:", error);
    throw error;
  }
};

export const createAnswer = async (questionId, data) => {
  try {
    // data: text_es, text_en, is_correct
    const response = await apiClient.post(`/questions/${questionId}/answers/`, data);
    return response.data;
  } catch (error) {
    console.error("Error creating answer:", error);
    throw error;
  }
};

export const deleteAnswer = async (questionId, answerId) => {
    try {
        await apiClient.delete(`/questions/${questionId}/answers/${answerId}/`);
    } catch (error) {
        console.error("Error deleting answer:", error);
        throw error;
    }
};

export const updateAnswer = async (questionId, answerId, data) => {
    try {
        const response = await apiClient.put(`/questions/${questionId}/answers/${answerId}/`, data);
        return response.data;
    } catch (error) {
        console.error("Error updating answer:", error);
        throw error;
    }
};

export const getTopicsBySubject = async (subjectId) => {
  try {
    const response = await apiClient.get(`/subjects/${subjectId}/topics/`);
    return response.data;
  } catch (error) {
    console.error("Error fetching topics:", error);
    throw error;
  }
};

export const getConceptsByTopic = async (topicId) => {
  try {
    const response = await apiClient.get(`/topics/${topicId}/concepts/`);
    return response.data;
  } catch (error) {
    console.error("Error fetching concepts:", error);
    throw error;
  }
};

export const getAnalytics = async (filters) => {
    // filters es objeto: { subject_id, group_id, group_by, etc. }
    try {
        const response = await apiClient.get('/analytics/performance/', { params: filters });
        return response.data;
    } catch (error) {
        console.error('Error fetching analytics:', error);
        throw error;
    }
};

export const resetAnalytics = async (params) => {
    // params: { scope: 'global'|'subject'|'specific', subject_id, group_by, target_id }
    try {
        const response = await apiClient.delete('/analytics/reset-analytics/', { params });
        return response.data;
    } catch (error) {
        console.error('Error resetting analytics:', error);
        throw error;
    }
};