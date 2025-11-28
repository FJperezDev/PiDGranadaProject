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

  getConcepts: async () => {
    try {
      const response = await apiClient.get('/concepts/');
      return response.data;
    } catch (error) {
      console.error('Error obteniendo los conceptos:', error);
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
      const response = await apiClient.get('/exams/generate-exam/?topics=' + topicTitles + '&nQuestions=' + nQuestions);
      return response.data;
    } catch (error) {
      console.error('Error generando examen:', error);
      throw error;
    }
  },

  evaluateExam: async (studentGroupCode, answers) => {
    try {
      // apiClient ya tiene la baseURL, así que solo ponemos la ruta relativa
      const response = await apiClient.post('/exams/evaluate-exam/', {
        student_group_code: studentGroupCode,
        questions_and_answers: answers
      });

      // Axios devuelve los datos directamente en la propiedad .data
      return response.data; 

    } catch (error) {
      console.error("Error en evaluateExam:", error);
      
      // En Axios, si el servidor responde con error (ej. 400 o 500), 
      // los detalles están en error.response.data
      const errorMessage = error.response?.data?.detail || 'Error evaluando el examen';
      
      throw new Error(errorMessage);
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
