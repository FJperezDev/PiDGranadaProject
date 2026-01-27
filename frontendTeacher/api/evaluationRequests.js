import { apiClient } from './api'

// --- PREGUNTAS ---

export const getQuestions = async () => (await apiClient.get('/questions/long-questions/')).data;

export const createQuestion = async (data) => {
    // data: { type, statement_es/en, explanation_es/en, topics_titles, concepts_names }
    const response = await apiClient.post('/questions/', data);
    return response.data;
};

export const updateQuestion = async (id, data) => {
    const response = await apiClient.patch(`/questions/${id}/`, data);
    return response.data;
};

export const deleteQuestion = async (id) => {
    await apiClient.delete(`/questions/${id}/`);
};

// --- RESPUESTAS ---

export const getAnswersByQuestion = async (questionId) => 
    (await apiClient.get(`/questions/${questionId}/answers/`)).data;

export const createAnswer = async (questionId, data) => {
    // data: { text_es, text_en, is_correct }
    const response = await apiClient.post(`/questions/${questionId}/answers/`, data);
    return response.data;
};

export const updateAnswer = async (questionId, answerId, data) => {
    const response = await apiClient.put(`/questions/${questionId}/answers/${answerId}/`, data);
    return response.data;
};

export const deleteAnswer = async (questionId, answerId) => {
    await apiClient.delete(`/questions/${questionId}/answers/${answerId}/`);
};

// --- SELECTORES (Para el Wizard) ---

export const getTopicsBySubject = async (subjectId) => 
    (await apiClient.get(`/subjects/${subjectId}/topics/`)).data;

export const getConceptsByTopic = async (topicId) => 
    (await apiClient.get(`/topics/${topicId}/concepts/`)).data;

// --- ANALÍTICAS ---

export const getAnalytics = async (filters) => {
    // filters: { subject_id, group_by, etc. }
    const response = await apiClient.get('/analytics/performance/', { params: filters });
    return response.data;
};

export const resetAnalytics = async (params) => {
    // params: { scope: 'global'|'subject'|'specific', ... }
    const response = await apiClient.delete('/analytics/reset-analytics/', { params });
    return response.data;
};