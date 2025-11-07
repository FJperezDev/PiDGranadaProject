import { apiClient } from './apiClient';

export const mockApi = {
  validateSubjectCode: async (code) => {
    try {
      const response = await apiClient.get('/studentgroups/validate/', { params: { code } });
      return response.data;
    } catch (error) {
      console.error('Error validando el código de asignatura:', error);
      throw error;
    }
  },

  getTopicDetails: async (topic_title) => {
    try {
      const response = await apiClient.get(`/topics/by-title/`, { params: { topic_title } });
      return response.data;
    } catch (error) {
      console.error('Error obteniendo detalles del tema:', error);
      throw error;
    }
  },

  getGameQuestions: async (language) => {
    try {
      const response = await apiClient.get('/game/questions');
      return response.data;
    } catch (error) {
      console.error('Error obteniendo preguntas del juego:', error);
      throw error;
    }
  },

  generateExam: async (topics, numQuestions) => {
    try {
      const response = await apiClient.post('/exam/generate', {
        topics,
        numQuestions,
      });
      return response.data;
    } catch (error) {
      console.error('Error generando examen:', error);
      throw error;
    }
  },

  getTopicsByCode: async (code) => {
    try {
      const response = await apiClient.get('/studentgroups/topics/', { params: { code } });
      return response.data;
    } catch (error) {
      console.error('Error obteniendo temas por código:', error);
      throw error;
    }
  },

};
