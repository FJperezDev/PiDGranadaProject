import { apiClient } from './api'

// --- Topics ---

export const getTopics = async () => (await apiClient.get('/topics/')).data;
export const createTopic = async (data) => (await apiClient.post('/topics/', data)).data;
export const deleteTopic = async (id) => (await apiClient.delete(`/topics/${id}/`)).data;
export const updateTopic = async (id, data) => (await apiClient.put(`/topics/${id}/`, data)).data;

// --- Epigraphs (Nested actions) ---

export const getTopicEpigraphs = async (topicId) => (await apiClient.get(`/topics/${topicId}/epigraphs/`)).data;
export const createEpigraph = async (topicId, data) => (await apiClient.post(`/topics/${topicId}/epigraphs/`, data)).data;
export const deleteEpigraph = async (topicId, orderId) => (await apiClient.delete(`/topics/${topicId}/epigraphs/${orderId}/`)).data;
export const updateEpigraph = async (topicId, orderId, data) => (await apiClient.put(`/topics/${topicId}/epigraphs/${orderId}/`, data)).data;

// --- Concepts ---

export const getAllConcepts = async () => (await apiClient.get('/concepts/')).data;
export const createConcept = async (data) => (await apiClient.post('/concepts/', data)).data;
export const deleteConcept = async (id) => (await apiClient.delete(`/concepts/${id}/`)).data;
export const updateConcept = async (id, data) => (await apiClient.put(`/concepts/${id}/`, data)).data;

// --- Conceptos (Linked actions) ---

export const getTopicConcepts = async (topicId) => (await apiClient.get(`/topics/${topicId}/concepts/`)).data;
export const linkConceptToTopic = async (topicId, conceptName) => (await apiClient.post(`/topics/${topicId}/concepts/`, { concept_name: conceptName })).data;
export const unlinkConceptFromTopic = async (topicId, conceptName) => (await apiClient.delete(`/topics/${topicId}/concepts/`, { data: { concept_name: conceptName } })).data;
export const linkConceptToConcept = async (parentConceptName, childConceptName) => (await apiClient.post(`/concepts/${parentConceptName}/concepts/`, { concept_name: childConceptName })).data;
export const unlinkConceptFromConcept = async (parentConceptName, childConceptName) => (await apiClient.delete(`/concepts/${parentConceptName}/concepts/`, { data: { concept_name: childConceptName } })).data;

