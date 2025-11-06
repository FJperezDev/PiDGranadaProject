import { apiClient } from './apiClient';

export const mockApi = {
  validateSubjectCode: async (code) => {
    try {
      const response = await apiClient.get('/studentgroups/validate/', { params: { code } });
      console.log('Respuesta del servidor:', JSON.stringify(response.data, null, 2));
      return response.data;
    } catch (error) {
      console.error('Error validando el código de asignatura:', error);
      throw error;
    }
  },

  getTopicDetails: async (title) => {
    try {
      const response = await apiClient.get(`/topics/by-title/`, { params: { title } });
      return response.data;
    } catch (error) {
      console.error('Error obteniendo detalles del tema:', error);
      throw error;
    }
  },

  getGameQuestions: async () => {
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
};
