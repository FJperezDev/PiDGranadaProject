import { apiClient } from './apiClient';

export const mockApi = {
  validateStudentGroupCode: async (code) => {
    try {
      const response = await apiClient.get('/studentgroups/exists/', { params: { code } });
      return response.data;
    } catch (error) {
      console.error('Error validando el código de asignatura:', error);
      throw error;
    }
  },

  getSubject: async (code) => {
    try {
      const response = await apiClient.get('/studentgroups/subject/', {params: { code } });
      return response.data;
    } catch (error) {
      console.error('Error obteniendo la asignatura:', error);
      throw error;
    }
  },

  getTopics: async (code) => {
    try {
      const response = await apiClient.get('/studentgroups/topics/', { params: { code } });
      return response.data;
    } catch (error) {
      console.error('Error obteniendo los temas:', error);
      throw error;
    }
  },

  getTopicDetails: async (title) => {
    try {
      const response = await apiClient.get(`/studentgroups/topic/`, {params: { title: title }});
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

  generateExam: async (topics, nQuestions) => {
    let topicTitles = "";
    if (topics && topics.length > 0) {
      topicTitles = topics.map(topic => topic.title).join(', ');
    }
    try {
      const response = await apiClient.get('/studentgroups/exam/?topics=' + topicTitles + '&nQuestions=' + nQuestions);
      return response.data;
    } catch (error) {
      console.error('Error generando examen:', error);
      throw error;
    }
  },

  getQuestion: async (id) => {
    try {
      const response = await apiClient.get('/studentgroups/question-translate/', {
        params: {
          questionId: id,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error obteniendo pregunta:', error);
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
