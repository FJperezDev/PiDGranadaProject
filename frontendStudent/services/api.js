export const mockApi = {
  validateSubjectCode: (code) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (code === 'ORG-101') {
          resolve({
            exists: true,
            subject: {
              id: 'org-101',
              name: 'Organización de Empresas',
              topics: [
                { id: 't1', name: 'Tema 1: Introducción', description: 'Conceptos básicos de la organización.' },
                { id: 't2', name: 'Tema 2: Estructuras', description: 'Tipos de estructuras organizativas.' },
                { id: 't3', name: 'Tema 3: Cultura', description: 'La cultura empresarial y su impacto.' },
              ],
            },
            
          });
          console.log("code: ", code)
        } else {
          resolve({ exists: false });
        }
      }, 500);
    });
  },
  getTopicDetails: (topicId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          concepts: [
            { id: 'c1', name: 'Concepto A', content: 'Contenido completo del Concepto A...' },
            { id: 'c2', name: 'Concepto B', content: 'Contenido completo del Concepto B...' },
          ],
          headings: [
            { id: 'h1', name: 'Epígrafe 1.1', description: 'Descripción del epígrafe 1.1', content: 'Contenido completo y detallado del Epígrafe 1.1...' },
            { id: 'h2', name: 'Epígrafe 1.2', description: 'Descripción del epígrafe 1.2', content: 'Contenido completo y detallado del Epígrafe 1.2...' },
          ],
        });
      }, 300);
    });
  },
  getGameQuestions: () => {
    return new Promise((resolve) => {
      resolve(
        Array.from({ length: 15 }, (_, i) => ({
          id: `gq${i + 1}`,
          text: `Pregunta del juego número ${i + 1}?`,
          options: ['Opción A', 'Opción B', 'Opción C'],
          correctAnswer: 'Opción A',
        }))
      );
    });
  },
  generateExam: (topicIds, numQuestions) => {
    return new Promise((resolve) => {
      resolve(
        Array.from({ length: numQuestions }, (_, i) => ({
          id: `eq${i + 1}`,
          text: `Pregunta de examen ${i + 1} (de Temas: ${topicIds.join(', ')})?`,
          options: ['Verdadero', 'Falso', 'Quizás'],
          correctAnswer: 'Verdadero',
          recommendation: 'Repasa el concepto de la pregunta X si fallaste.'
        }))
      );
    });
  },
};