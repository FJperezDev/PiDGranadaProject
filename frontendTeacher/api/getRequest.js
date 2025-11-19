import { instance } from './api'; // Usamos tu instancia configurada (con tokens)

// --- USUARIOS (Tus funciones existentes) ---

export const getLoggedUserInfo = async () => {
    try {
        const res = await instance.get("/account/profile/");
        return res.data;
    } catch (err) {
        console.error("Error fetching logged user data: ", err);
        return null;
    }
}

export const getUserInfo = async (userId) => {
    try {
        const uri = "/users/" + userId + "/";
        const res = await instance.get(uri);
        return res.data;
    } catch (err) {
        console.error("Error fetching user data: ", err);
        return null;
    }
}

export const getUsersList = async () => {
    try {
        const res = await instance.get("/users/");
        return res.data;
    } catch (err) {
        console.error("Error fetching users list: ", err);
        return null;
    }
}

// --- ASIGNATURAS Y GRUPOS ---

export const getSubjects = async () => {
    try {
        const response = await instance.get('/subjects/');
        return response.data;
    } catch (error) {
        console.error("Error fetching subjects:", error.response?.data || error.message);
        throw error;
    }
};

export const getMyGroups = async () => {
    try {
        const response = await instance.get('/studentgroups/my-groups/');
        return response.data;
    } catch (error) {
        console.error("Error fetching my groups:", error.response?.data || error.message);
        throw error;
    }
};

export const getOtherGroups = async () => {
  try {
    const response = await instance.get('/studentgroups/others-groups/');
    return response.data;
  } catch (error) {
    console.error("Error fetching others groups:", error.response?.data || error.message);
    throw error;
  }
};

export const createGroup = async (subjectId, name) => {
    try {
        const payload = { name_es: name, name_en: name };
        const response = await instance.post(`/subjects/${subjectId}/groups/`, payload);
        return response.data;
    } catch (error) {
        console.error("Error creating group:", error.response?.data || error.message);
        throw error;
    }
};

export const deleteGroup = async (subjectId, groupId) => {
    try {
        await instance.delete(`/subjects/${subjectId}/groups/${groupId}/`);
    } catch (error) {
        console.error("Error deleting group:", error.response?.data || error.message);
        throw error;
    }
};

export const getTopicsBySubject = async (subjectId) => {
    try {
        const response = await instance.get(`/subjects/${subjectId}/topics/`);
        return response.data;
    } catch (error) {
        console.error("Error fetching topics:", error);
        throw error;
    }
};


// --- PREGUNTAS (NUEVO / CORREGIDO) ---

export const getQuestions = async () => {
    try {
        const response = await instance.get('/questions/long-questions/');
        return response.data;
    } catch (error) {
        console.error("Error fetching questions:", error);
        throw error;
    }
};

export const createQuestion = async (data) => {
    try {
        const response = await instance.post('/questions/', data);
        return response.data;
    } catch (error) {
        console.error("Error creating question:", error.response?.data);
        throw error;
    }
};

export const updateQuestion = async (id, data) => {
    try {
        // Usamos PUT obligatoriamente para que entre en tu método def update() del backend
        const response = await instance.put(`/questions/${id}/`, data);
        return response.data;
    } catch (error) {
        console.error("Error updating question:", error);
        throw error;
    }
};

export const deleteQuestion = async (id) => {
    try {
        await instance.delete(`/questions/${id}/`);
    } catch (error) {
        console.error("Error deleting question:", error);
        throw error;
    }
};

// --- RESPUESTAS (NUEVO / CORREGIDO) ---

export const getAnswersByQuestion = async (questionId) => {
    try {
        const response = await instance.get(`/questions/${questionId}/answers/`);
        return response.data;
    } catch (error) {
        console.error("Error fetching answers:", error);
        throw error;
    }
};

export const createAnswer = async (questionId, data) => {
    try {
        const response = await instance.post(`/questions/${questionId}/answers/`, data);
        return response.data;
    } catch (error) {
        console.error("Error creating answer:", error);
        throw error;
    }
};

export const updateAnswer = async (questionId, answerId, data) => {
    try {
        const response = await instance.put(`/questions/${questionId}/answers/${answerId}/`, data);
        return response.data;
    } catch (error) {
        console.error("Error updating answer:", error);
        throw error;
    }
};

export const deleteAnswer = async (questionId, answerId) => {
    try {
        await instance.delete(`/questions/${questionId}/answers/${answerId}/`);
    } catch (error) {
        console.error("Error deleting answer:", error);
        throw error;
    }
};