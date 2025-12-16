import { apiClient } from './api'

// --- Topics ---

export const getTopics = async () => (await apiClient.get('/topics/')).data;
export const getTopicInfo = async (id) => (await apiClient.get(`/topics/${id}/`)).data
export const createTopic = async (data) => (await apiClient.post('/topics/', data)).data;
export const deleteTopic = async (id) => (await apiClient.delete(`/topics/${id}/`)).data;
export const updateTopic = async (id, data) => (
  console.log(data),
  await apiClient.put(`/topics/${id}/`, data)).data;

export const getSubjectTopics = async (subjectId) => 
  (await apiClient.get(`/subjects/${subjectId}/topics/`)).data;

export const swapTopicOrder = async (subjectId, topicA_Title, topicB_Title) => {
  return (await apiClient.put(`/subjects/${subjectId}/topics/`, {
    topicA: topicA_Title,
    topicB: topicB_Title
  })).data;
};

export const subjectIsAboutTopic = async (subjectId, topicName) => (await apiClient.post(`/subjects/${subjectId}/topics/`, {topic_name: topicName})).data;

export const subjectIsNotAboutTopic = async (subjectId, topicName) => {
  return (await apiClient.delete(`/subjects/${subjectId}/topics/`, { 
    data: { topic_name: topicName } 
  })).data;
};

export const topicIsAboutConcept = async (topicId, conceptName) => (await apiClient.post(`/topics/${topicId}/concepts/`, {concept_name: conceptName})).data;

export const topicIsNotAboutConcept = async (topicId, conceptName, conceptId = null) => {
  return (await apiClient.delete(`/topics/${topicId}/concepts/`, { 
    data: { 
        concept_name: conceptName,
        concept_id: conceptId // Enviamos también el ID si lo tenemos
    } 
  })).data;
};

// --- Epigraphs (Nested actions) ---

export const getTopicEpigraphs = async (topicId) => (await apiClient.get(`/topics/${topicId}/epigraphs/`)).data;
export const createEpigraph = async (topicId, data) => (await apiClient.post(`/topics/${topicId}/epigraphs/`, data)).data;
export const getEpigraphDetail = async (topicId, orderId) => (await apiClient.get(`/topics/${topicId}/epigraphs/${orderId}/`)).data;
export const deleteEpigraph = async (topicId, orderId) => (await apiClient.delete(`/topics/${topicId}/epigraphs/${orderId}/`)).data;
export const updateEpigraph = async (topicId, orderId, data) => (await apiClient.put(`/topics/${topicId}/epigraphs/${orderId}/`, data)).data;

// --- Concepts ---

export const getAllConcepts = async () => (await apiClient.get('/concepts/')).data;
export const getConceptInfo = async (id) => (await apiClient.get(`/concepts/${id}/`)).data
export const createConcept = async (data) => (await apiClient.post('/concepts/', data)).data;
export const deleteConcept = async (id) => (await apiClient.delete(`/concepts/${id}/`)).data;
export const updateConcept = async (id, data) => (await apiClient.put(`/concepts/${id}/`, data)).data;
// --- Conceptos (Linked actions) ---


export const getTopicConcepts = async (topicId) => (await apiClient.get(`/topics/${topicId}/concepts/`)).data;

export const linkConceptToConcept = async (parentId, childId, description_es = '', description_en = '') => {
  const response = await apiClient.post(`/concepts/${parentId}/concepts/`, { // Verifica tu URL exacta
    concept_id: childId, 
    description_es: description_es,
    description_en: description_en,
  });
  return response.data;
};

// Esta función déjala como la arreglamos antes (usando ID)
export const unlinkConceptFromConcept = async (parentId, childConceptId) => {
  return (await apiClient.delete(`/concepts/${parentId}/concepts/`, { 
    data: { 
      concept_id: childConceptId 
    } 
  })).data;
};

