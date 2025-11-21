export const getTopics = async () => {
  // GET /topics/
  // Retorna la lista base de topics
  // return axios.get('/topics/');
  
  // MOCK DATA
  return [
    { id: 1, title_es: 'Introducción a la IA', title_en: 'Intro to AI', description_es: 'Conceptos básicos...' },
    { id: 2, title_es: 'Redes Neuronales', title_en: 'Neural Networks', description_es: 'Deep learning...' },
  ];
};

export const createTopic = async (data) => {
  // POST /topics/
  console.log("Creating topic:", data);
  return true;
};

export const deleteTopic = async (id) => {
  // DELETE /topics/<id>/
  console.log("Deleting topic:", id);
  return true;
};

// --- Epígrafes (Nested actions) ---

export const getTopicEpigraphs = async (topicId) => {
  // GET /topics/<id>/epigraphs/
  // return axios.get(`/topics/${topicId}/epigraphs/`);
  
  // MOCK
  return [
    { id: 101, order_id: 1, name_es: 'Historia', description_es: 'Orígenes...' },
    { id: 102, order_id: 2, name_es: 'Estado del arte', description_es: 'Actualidad...' },
  ];
};

export const createEpigraph = async (topicId, data) => {
  // POST /topics/<id>/epigraphs/
  // body: { name_es, name_en, description_es, description_en, order_id }
  console.log(`Creating epigraph for topic ${topicId}:`, data);
  return true;
};

export const deleteEpigraph = async (topicId, orderId) => {
  // DELETE /topics/<id>/epigraphs/<order_id>/
  // Nota: Tu view usa order_id en la URL para delete
  console.log(`Deleting epigraph ${orderId} from topic ${topicId}`);
  return true;
};

// --- Conceptos (Linked actions) ---

export const getTopicConcepts = async (topicId) => {
  // GET /topics/<id>/concepts/
  // return axios.get(`/topics/${topicId}/concepts/`);

  // MOCK
  return [
    { id: 501, name_es: 'Algoritmo', description_es: 'Secuencia de pasos...' },
    { id: 502, name_es: 'Datos', description_es: 'Información cruda...' },
  ];
};

export const linkConceptToTopic = async (topicId, conceptName) => {
  // POST /topics/<id>/concepts/
  // body: { concept_name: "..." } (Tu backend crea o busca por nombre)
  console.log(`Linking concept "${conceptName}" to topic ${topicId}`);
  return true;
};

export const unlinkConceptFromTopic = async (topicId, conceptName) => {
  // DELETE /topics/<id>/concepts/
  // body: { concept_name: "..." }
  console.log(`Unlinking concept "${conceptName}" from topic ${topicId}`);
  return true;
};