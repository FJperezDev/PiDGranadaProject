function randomIndex(options=[]) {
  if (options.length === 0) {
    return 7;
  }
  const randomIndex = Math.floor(Math.random() * options.length);
  return options[randomIndex];
}

export const GAME_QUESTIONS = {
  es: [
    {
      id: "gq1",
      text: "¿Qué mecanismo de coordinación predomina?",
      options: [
        { text: "Supervisión directa", code: 0 },
        { text: "Normalización de los procesos de trabajo", code: 1 },
        { text: "Normalización de los resultados", code: 2 },
        { text: "Adaptación mutua", code: 3 },
        { text: "Normalización de las habilidades", code: 4 },
        { text: "Normalización de los valores", code: 5 },
        { text: "No lo sé", code: 6 }
      ],
    },
    {
      id: "gq2",
      text: "¿Qué parte de la organización es más importante?",
      options: [
        { text: "Ápice estratégico", code: 0 },
        { text: "Tecnoestructura", code: 1 },
        { text: "Línea media", code: 2 },
        { text: "Staff de apoyo", code: 3 },
        { text: "Núcleo de operaciones", code: 4 },
        { text: "Todas", code: 5 },
        { text: "No lo sé", code: 6 }
      ],
    },
    {
      id: "gq3",
      text: "¿Cómo es la especialización de los puestos?",
      options: [
        { text: "Escasa especialización", code: 0 },
        { text: "Mucha especialización horizontal y vertical", code: 1 },
        { text: "Cierta especialización horizontal y vertical (entre divisiones y sede central)", code: 2 },
        { text: "Mucha especialización horizontal", code: 3 },
        { text: "Escasa especialización", code: randomIndex([4, 5]) },
        { text: "No lo sé", code: 6 }
      ],
    },
    {
      id: "gq4",
      text: "¿Qué nivel de preparación existe?",
      options: [
        { text: "Baja preparación", code: randomIndex([0, 1])},
        { text: "Cierta preparación (de los directivos de división)", code: 2 },
        { text: "Alta preparación", code: randomIndex([3, 4])},
        { text: "Preparación referida a la socialización", code: 5 },
        { text: "No lo sé", code: 6 }
      ],
    },
    {
      id: "gq5",
      text: "¿Cómo es el adoctrinamiento?",
      options: [
        { text: "Bajo adoctrinamiento", code: randomIndex([0, 1]) },
        { text: "Adoctrinamiento en los directivos de división", code: 2 },
        { text: "La cultura es de innovación", code: 3 },
        { text: "Alto adoctrinamiento", code: randomIndex([4, 5]) },
        { text: "No lo sé", code: 6 }
      ],
    },
    {
      id: "gq6",
      text: "¿Cómo es la formalización del comportamiento?",
      options: [
        { text: "Escasa formalización", code: randomIndex([0, 3, 4, 5]) },
        { text: "Mucha formalización", code: 1 },
        { text: "Mucha formalización (dentro de las divisiones)", code: 2 },
        { text: "No lo sé", code: 6 }
      ],
    },
    {
      id: "gq7",
      text: "¿Qué base de agrupación predomina?",
      options: [
        { text: "No hay unidades o es funcional", code: 0 },
        { text: "Funcional", code: 1 },
        { text: "De mercado", code: randomIndex([2, 5]) },
        { text: "Funcional y de mercados simultáneamente", code: 3 },
        { text: "Podría ser considerada funcional o de mercado", code: 4 },
        { text: "No lo sé", code: 6 }
      ],
    },
    {
      id: "gq8", 
      text: "¿Cómo es el tamaño de las unidades?",
      options: [
        { text: "Pequeña si hay unidades, grande si solo hay una unidad", code: 0 },
        { text: "Grande en la base, pequeño en el resto de la jerarquía", code: 1 },
        { text: "Grande en la parte superior de la jerarquía", code: 2 },
        { text: "Grupos de trabajo pequeños", code: 3 },
        { text: "Grande en la base, pequeño en el resto de la jerarquía", code: 4 },
        { text: "Grupos de trabajo grandes", code: 5 },
        { text: "No lo sé", code: 6 }
      ],
    },
    {
      id: "gq9",
      text: "¿Cómo son los sistemas de planificación y control?",
      options: [
        { text: "Escasa planificación y control", code: randomIndex([0, 3, 4, 5]) },
        { text: "Mucha planificación de acciones", code: 1 },
        { text: "Mucho control del rendimiento", code: 2 },
        { text: "No lo sé", code: 6 }
      ],
    },
    {
      id: "gq10", 
      text: "¿Existen dispositivos de enlace?",
      options: [
        { text: "Pocos", code: randomIndex([0, 1, 2]) },
        { text: "Muchos, por toda la jerarquía", code: 3 },
        { text: "Algunos", code: randomIndex([4, 5]) },
        { text: "No lo sé", code: 6 }
      ],
    },
    {
      id: "gq11", 
      text: "¿Qué tipo de centralización o descentralización tiene?",
      options: [
        { text: "Centralización horizontal y vertical", code: 0 },
        { text: "Descentralización horizontal limitada", code: 1 },
        { text: "Descentralización vertical limitada", code: 2 },
        { text: "Descentralización horizontal y vertical selectiva", code: 3 },
        { text: "Descentralización horizontal y vertical limitada", code: 4 },
        { text: "Descentralización horizontal y vertical máxima", code: 5 },
        { text: "No lo sé", code: 6 }
      ],
    },

    {
      id: "gq12",
      text: "¿Cómo es en cuanto a su edad?",
      options: [
        { text: "Joven, está en su primera etapa", code: 0 },
        { text: "Joven, está en su segunda etapa", code: 1 },
        { text: "Joven, está en su tercera etapa", code: 2 },
        { text: "Joven, está en su cuarta etapa", code: 3 },
        { text: "Joven, está en su quinta etapa", code: 4 },
        { text: "Joven, está en su sexta etapa", code: 5 },
        { text: "No lo sé", code: 6 }
      ],
    },
    {
      id: "gq13",
      text: "¿Qué tamaño tiene la organización?",
      options: [
        { text: "Grande", code: 0 },
        { text: "Mediana", code: 1 },
        { text: "Pequeña", code: 2 },
        { text: "Muy pequeña", code: randomIndex([3, 4, 5]) },
        { text: "No lo sé", code: 6 }
      ],
    },
    {
      id: "gq14", 
      text: "¿Cómo es el sistema técnico?",
      options: [
        { text: "Sencillo, no regulador", code: 0 },
        { text: "Regulador pero no automatizado ni muy sofisticado", code: 1 },
        { text: "Susceptible de ser dividido", code: 2 },
        { text: "Automatizado o no regulador", code: 3 },
        { text: "Ni regulador ni sofisticado", code: 4 },
        { text: "Muy sencillo", code: 5 },
        { text: "No lo sé", code: 6 }
      ],
    },
    {
      id: "gq15",
      text: "¿Cómo es su entorno?",
      options: [
        { text: "Sencillo y dinámico", code: 0 },
        { text: "Hostil", code: 1 },
        { text: "Sencillo y estable", code: 2 },
        { text: "Diversificado", code: 3 },
        { text: "Complejo y dinámico", code: 4 },
        { text: "Complejo y estable", code: 5 },
        { text: "No lo sé", code: 6 }
      ],
    },
    {
      id: "gq16",
      text: "¿Cómo es el poder?",
      options: [
        { text: "Control del director general o propietario", code: 0 },
        { text: "Control de la tecnoestructura o control externo", code: 1 },
        { text: "Control de la línea media", code: 2 },
        { text: "Control del experto", code: 3 },
        { text: "Control de los operarios", code: 4 },
        { text: "Control por la ideología", code: 5 },
        { text: "No lo sé", code: 6 }
      ],
    }
  ],
  
  en: [
    {
      id: "gq1",
      text: "Which coordination mechanism predominates?",
      options: [
        { text: "Direct supervision", code: 0 },
        { text: "Standardization of work processes", code: 1 },
        { text: "Standardization of outputs", code: 2 },
        { text: "Mutual adjustment", code: 3 },
        { text: "Standardization of skills", code: 4 },
        { text: "Standardization of norms", code: 5 },
        { text: "I don't know", code: 6 }
      ],
    },
    {
      id: "gq2",
      text: "Which part of the organization is most important?",
      options: [
        { text: "Strategic apex", code: 0 },
        { text: "Technostructure", code: 1 },
        { text: "Middle line", code: 2 },
        { text: "Support staff", code: 3 },
        { text: "Operating core", code: 4 },
        { text: "All of them", code: 5 },
        { text: "I don't know", code: 6 }
      ],
    },
    {
      id: "gq3",
      text: "What is the job specialization like?",
      options: [
        { text: "Low specialization", code: 0 },
        { text: "High horizontal and vertical specialization", code: 1 },
        { text: "Some horizontal and vertical specialization (between divisions and headquarters)", code: 2 },
        { text: "High horizontal specialization", code: 3 },
        { text: "Low specialization", code: randomIndex([4, 5]) },
        { text: "I don't know", code: 6 }
      ],
    },
    {
      id: "gq4",
      text: "What is the level of training?",
      options: [
        { text: "Low training", code: randomIndex([0, 1])},
        { text: "Some training (of division managers)", code: 2 },
        { text: "High training", code: randomIndex([3, 4])},
        { text: "Training related to socialization", code: 5 },
        { text: "I don't know", code: 6 }
      ],
    },
    {
      id: "gq5",
      text: "What is the indoctrination like?",
      options: [
        { text: "Low indoctrination", code: randomIndex([0, 1]) },
        { text: "Indoctrination of division managers", code: 2 },
        { text: "The culture is one of innovation", code: 3 },
        { text: "High indoctrination", code: randomIndex([4, 5]) },
        { text: "I don't know", code: 6 }
      ],
    },
    {
      id: "gq6",
      text: "What is the formalization of behavior like?",
      options: [
        { text: "Low formalization", code: randomIndex([0, 3, 4, 5]) },
        { text: "High formalization", code: 1 },
        { text: "High formalization (within the divisions)", code: 2 },
        { text: "I don't know", code: 6 }
      ],
    },
    {
      id: "gq7",
      text: "Which grouping basis predominates?",
      options: [
        { text: "No units or it is functional", code: 0 },
        { text: "Functional", code: 1 },
        { text: "Market-based", code: randomIndex([2, 5]) },
        { text: "Functional and market-based simultaneously", code: 3 },
        { text: "Could be considered functional or market-based", code: 4 },
        { text: "I don't know", code: 6 }
      ],
    },
    {
      id: "gq8", 
      text: "What is the size of the units?",
      options: [
        { text: "Small if there are units, large if there is only one unit", code: 0 },
        { text: "Large at the base, small in the rest of the hierarchy", code: 1 },
        { text: "Large at the top of the hierarchy", code: 2 },
        { text: "Small work groups", code: 3 },
        { text: "Large at the base, small in the rest of the hierarchy", code: 4 },
        { text: "Large work groups", code: 5 },
        { text: "I don't know", code: 6 }
      ],
    },
    {
      id: "gq9",
      text: "What are the planning and control systems like?",
      options: [
        { text: "Little planning and control", code: randomIndex([0, 3, 4, 5]) },
        { text: "High action planning", code: 1 },
        { text: "High performance control", code: 2 },
        { text: "I don't know", code: 6 }
      ],
    },
    {
      id: "gq10", 
      text: "Are there liaison devices?",
      options: [
        { text: "Few", code: randomIndex([0, 1, 2]) },
        { text: "Many, throughout the hierarchy", code: 3 },
        { text: "Some", code: randomIndex([4, 5]) },
        { text: "I don't know", code: 6 }
      ],
    },
    {
      id: "gq11", 
      text: "What type of centralization or decentralization does it have?",
      options: [
        { text: "Horizontal and vertical centralization", code: 0 },
        { text: "Limited horizontal decentralization", code: 1 },
        { text: "Limited vertical decentralization", code: 2 },
        { text: "Selective horizontal and vertical decentralization", code: 3 },
        { text: "Limited horizontal and vertical decentralization", code: 4 },
        { text: "Maximum horizontal and vertical decentralization", code: 5 },
        { text: "I don't know", code: 6 }
      ],
    },
    {
      id: "gq12",
      text: "What about its age?",
      options: [
        { text: "Young, it is in its first stage", code: 0 },
        { text: "Young, it is in its second stage", code: 1 },
        { text: "Young, it is in its third stage", code: 2 },
        { text: "Young, it is in its fourth stage", code: 3 },
        { text: "Young, it is in its fifth stage", code: 4 },
        { text: "Young, it is in its sixth stage", code: 5 },
        { text: "I don't know", code: 6 }
      ],
    },
    {
      id: "gq13",
      text: "What is the size of the organization?",
      options: [
        { text: "Large", code: 0 },
        { text: "Medium", code: 1 },
        { text: "Small", code: 2 },
        { text: "Very small", code: randomIndex([3, 4, 5]) },
        { text: "I don't know", code: 6 }
      ],
    },
    {
      id: "gq14", 
      text: "What is the technical system like?",
      options: [
        { text: "Simple, not regulating", code: 0 },
        { text: "Regulating but not automated or very sophisticated", code: 1 },
        { text: "Susceptible to being divided", code: 2 },
        { text: "Automated or not regulating", code: 3 },
        { text: "Neither regulating nor sophisticated", code: 4 },
        { text: "Very simple", code: 5 },
        { text: "I don't know", code: 6 }
      ],
    },
    {
      id: "gq15",
      text: "What is its environment like?",
      options: [
        { text: "Simple and dynamic", code: 0 },
        { text: "Hostile", code: 1 },
        { text: "Simple and stable", code: 2 },
        { text: "Diversified", code: 3 },
        { text: "Complex and dynamic", code: 4 },
        { text: "Complex and stable", code: 5 },
        { text: "I don't know", code: 6 }
      ],
    },
    {
      id: "gq16",
      text: "What is the power like?",
      options: [
        { text: "Control by the general manager or owner", code: 0 },
        { text: "Control by the technostructure or external control", code: 1 },
        { text: "Control by the middle line", code: 2 },
        { text: "Control by the expert", code: 3 },
        { text: "Control by the operators", code: 4 },
        { text: "Control by ideology", code: 5 },
        { text: "I don't know", code: 6 }
      ],
    }
  ],
};

export const GAME_SOLUTION = {
  es: {
    "0": { text: "Estructura Simple", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/0.png" },
    "01": { text: "Estructura Simple que evoluciona hacia una Burocracia Maquinal", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/01.png" },
    "012": { text: "Estructura Simple que evoluciona hacia una Burocracia Maquinal y/o Forma Divisional", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/012.png" },
    "013": { text: "Estructura Simple que evoluciona hacia una Burocracia Maquinal y/o Adhocracia", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/013.png" },
    "014": { text: "Estructura Simple que evoluciona hacia una Burocracia Maquinal y/o Burocracia Profesional", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/014.png" },
    "015": { text: "Estructura Simple que evoluciona hacia una Burocracia Maquinal y/o Organización Misional", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/015.png" },
    "02": { text: "Estructura Simple que evoluciona hacia una Forma Divisional", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/02.png" },
    "021": { text: "Estructura Simple que evoluciona hacia una Forma Divisional y/o Burocracia Maquinal", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/021.png" },
    "023": { text: "Estructura Simple que evoluciona hacia una Forma Divisional y/o Adhocracia", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/023.png" },
    "024": { text: "Estructura Simple que evoluciona hacia una Forma Divisional y/o Burocracia Profesional", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/024.png" },
    "025": { text: "Estructura Simple que evoluciona hacia una Forma Divisional y/o Organización Misional", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/025.png" },
    "03": { text: "Estructura Simple que evoluciona hacia una Adhocracia", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/03.png" },
    "031": { text: "Estructura Simple que evoluciona hacia una Adhocracia y/o Burocracia Maquinal", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/031.png" },
    "032": { text: "Estructura Simple que evoluciona hacia una Adhocracia y/o Forma Divisional", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/032.png" },
    "034": { text: "Estructura Simple que evoluciona hacia una Adhocracia y/o Burocracia Profesional", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/034.png" },
    "035": { text: "Estructura Simple que evoluciona hacia una Adhocracia y/o Organización Misional", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/035.png" },
    "04": { text: "Estructura Simple que evoluciona hacia una Burocracia Profesional", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/04.png" },
    "041": { text: "Estructura Simple que evoluciona hacia una Burocracia Profesional y/o Burocracia Maquinal", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/041.png" },
    "042": { text: "Estructura Simple que evoluciona hacia una Burocracia Profesional y/o Forma Divisional", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/042.png" },
    "043": { text: "Estructura Simple que evoluciona hacia una Burocracia Profesional y/o Adhocracia", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/043.png" },
    "045": { text: "Estructura Simple que evoluciona hacia una Burocracia Profesional y/o Organización Misional", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/045.png" },
    "05": { text: "Estructura Simple que evoluciona hacia una Organización Misional", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/05.png" },
    "051": { text: "Estructura Simple que evoluciona hacia una Organización Misional y/o Burocracia Maquinal", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/051.png" },
    "052": { text: "Estructura Simple que evoluciona hacia una Organización Misional y/o Forma Divisional", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/052.png" },
    "053": { text: "Estructura Simple que evoluciona hacia una Organización Misional y/o Adhocracia", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/053.png" },
    "054": { text: "Estructura Simple que evoluciona hacia una Organización Misional y/o Burocracia Profesional", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/054.png" },
    "1": { text: "Burocracia Maquinal", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/1.png" },
    "10": { text: "Burocracia Maquinal que evoluciona hacia una Estructura Simple", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/10.png" },
    "102": { text: "Burocracia Maquinal que evoluciona hacia una Estructura Simple y/o Forma Divisional", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/102.png" },
    "103": { text: "Burocracia Maquinal que evoluciona hacia una Estructura Simple y/o Adhocracia", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/103.png" },
    "104": { text: "Burocracia Maquinal que evoluciona hacia una Estructura Simple y/o Burocracia Profesional", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/104.png" },
    "105": { text: "Burocracia Maquinal que evoluciona hacia una Estructura Simple y/o Organización Misional", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/105.png" },
    "12": { text: "Burocracia Maquinal que evoluciona hacia una Forma Divisional", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/12.png" },
    "120": { text: "Burocracia Maquinal que evoluciona hacia una Forma Divisional y/o Estructura Simple", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/120.png" },
    "123": { text: "Burocracia Maquinal que evoluciona hacia una Forma Divisional y/o Adhocracia", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/123.png" },
    "124": { text: "Burocracia Maquinal que evoluciona hacia una Forma Divisional y/o Burocracia Profesional", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/124.png" },
    "125": { text: "Burocracia Maquinal que evoluciona hacia una Forma Divisional y/o Organización Misional", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/125.png" },
    "13": { text: "Burocracia Maquinal que evoluciona hacia una Adhocracia", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/13.png" },
    "130": { text: "Burocracia Maquinal que evoluciona hacia una Adhocracia y/o Estructura Simple", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/130.png" },
    "132": { text: "Burocracia Maquinal que evoluciona hacia una Adhocracia y/o Forma Divisional", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/132.png" },
    "134": { text: "Burocracia Maquinal que evoluciona hacia una Adhocracia y/o Burocracia Profesional", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/134.png" },
    "135": { text: "Burocracia Maquinal que evoluciona hacia una Adhocracia y/o Organización Misional", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/135.png" },
    "14": { text: "Burocracia Maquinal que evoluciona hacia una Burocracia Profesional", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/14.png" },
    "140": { text: "Burocracia Maquinal que evoluciona hacia una Burocracia Profesional y/o Estructura Simple", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/140.png" },
    "142": { text: "Burocracia Maquinal que evoluciona hacia una Burocracia Profesional y/o Forma Divisional", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/142.png" },
    "143": { text: "Burocracia Maquinal que evoluciona hacia una Burocracia Profesional y/o Adhocracia", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/143.png" },
    "145": { text: "Burocracia Maquinal que evoluciona hacia una Burocracia Profesional y/o Organización Misional", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/145.png" },
    "15": { text: "Burocracia Maquinal que evoluciona hacia una Organización Misional", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/15.png" },
    "150": { text: "Burocracia Maquinal que evoluciona hacia una Organización Misional y/o Estructura Simple", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/150.png" },
    "152": { text: "Burocracia Maquinal que evoluciona hacia una Organización Misional y/o Forma Divisional", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/152.png" },
    "153": { text: "Burocracia Maquinal que evoluciona hacia una Organización Misional y/o Adhocracia", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/153.png" },
    "154": { text: "Burocracia Maquinal que evoluciona hacia una Organización Misional y/o Burocracia Profesional", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/154.png" },
    "2": { text: "Forma Divisional", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/2.png" },
    "20": { text: "Forma Divisional que evoluciona hacia una Estructura Simple", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/20.png" },
    "201": { text: "Forma Divisional que evoluciona hacia una Estructura Simple y/o Burocracia Maquinal", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/201.png" },
    "203": { text: "Forma Divisional que evoluciona hacia una Estructura Simple y/o Adhocracia", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/203.png" },
    "204": { text: "Forma Divisional que evoluciona hacia una Estructura Simple y/o Burocracia Profesional", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/204.png" },
    "205": { text: "Forma Divisional que evoluciona hacia una Estructura Simple y/o Organización Misional", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/205.png" },
    "21": { text: "Forma Divisional que evoluciona hacia una Burocracia Maquinal", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/21.png" },
    "210": { text: "Forma Divisional que evoluciona hacia una Burocracia Maquinal y/o Estructura Simple", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/210.png" },
    "213": { text: "Forma Divisional que evoluciona hacia una Burocracia Maquinal y/o Adhocracia", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/213.png" },
    "214": { text: "Forma Divisional que evoluciona hacia una Burocracia Maquinal y/o Burocracia Profesional", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/214.png" },
    "215": { text: "Forma Divisional que evoluciona hacia una Burocracia Maquinal y/o Organización Misional", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/215.png" },
    "23": { text: "Forma Divisional que evoluciona hacia una Adhocracia", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/23.png" },
    "230": { text: "Forma Divisional que evoluciona hacia una Adhocracia y/o Estructura Simple", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/230.png" },
    "231": { text: "Forma Divisional que evoluciona hacia una Adhocracia y/o Burocracia Maquinal", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/231.png" },
    "234": { text: "Forma Divisional que evoluciona hacia una Adhocracia y/o Burocracia Profesional", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/234.png" },
    "235": { text: "Forma Divisional que evoluciona hacia una Adhocracia y/o Organización Misional", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/235.png" },
    "24": { text: "Forma Divisional que evoluciona hacia una Burocracia Profesional", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/24.png" },
    "240": { text: "Forma Divisional que evoluciona hacia una Burocracia Profesional y/o Estructura Simple", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/240.png" },
    "241": { text: "Forma Divisional que evoluciona hacia una Burocracia Profesional y/o Burocracia Maquinal", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/241.png" },
    "243": { text: "Forma Divisional que evoluciona hacia una Burocracia Profesional y/o Adhocracia", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/243.png" },
    "245": { text: "Forma Divisional que evoluciona hacia una Burocracia Profesional y/o Organización Misional", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/245.png" },
    "25": { text: "Forma Divisional que evoluciona hacia una Organización Misional", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/25.png" },
    "250": { text: "Forma Divisional que evoluciona hacia una Organización Misional y/o Estructura Simple", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/250.png" },
    "251": { text: "Forma Divisional que evoluciona hacia una Organización Misional y/o Burocracia Maquinal", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/251.png" },
    "253": { text: "Forma Divisional que evoluciona hacia una Organización Misional y/o Adhocracia", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/253.png" },
    "254": { text: "Forma Divisional que evoluciona hacia una Organización Misional y/o Burocracia Profesional", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/254.png" },
    "3": { text: "Adhocracia", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/3.png" },
    "30": { text: "Adhocracia que evoluciona hacia una Estructura Simple", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/30.png" },
    "301": { text: "Adhocracia que evoluciona hacia una Estructura Simple y/o Burocracia Maquinal", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/301.png" },
    "302": { text: "Adhocracia que evoluciona hacia una Estructura Simple y/o Forma Divisional", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/302.png" },
    "304": { text: "Adhocracia que evoluciona hacia una Estructura Simple y/o Burocracia Profesional", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/304.png" },
    "305": { text: "Adhocracia que evoluciona hacia una Estructura Simple y/o Organización Misional", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/305.png" },
    "31": { text: "Adhocracia que evoluciona hacia una Burocracia Maquinal", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/31.png" },
    "310": { text: "Adhocracia que evoluciona hacia una Burocracia Maquinal y/o Estructura Simple", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/310.png" },
    "312": { text: "Adhocracia que evoluciona hacia una Burocracia Maquinal y/o Forma Divisional", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/312.png" },
    "314": { text: "Adhocracia que evoluciona hacia una Burocracia Maquinal y/o Burocracia Profesional", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/314.png" },
    "315": { text: "Adhocracia que evoluciona hacia una Burocracia Maquinal y/o Organización Misional", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/315.png" },
    "32": { text: "Adhocracia que evoluciona hacia una Forma Divisional", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/32.png" },
    "320": { text: "Adhocracia que evoluciona hacia una Forma Divisional y/o Estructura Simple", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/320.png" },
    "321": { text: "Adhocracia que evoluciona hacia una Forma Divisional y/o Burocracia Maquinal", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/321.png" },
    "324": { text: "Adhocracia que evoluciona hacia una Forma Divisional y/o Burocracia Profesional", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/324.png" },
    "325": { text: "Adhocracia que evoluciona hacia una Forma Divisional y/o Organización Misional", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/325.png" },
    "34": { text: "Adhocracia que evoluciona hacia una Burocracia Profesional", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/34.png" },
    "340": { text: "Adhocracia que evoluciona hacia una Burocracia Profesional y/o Estructura Simple", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/340.png" },
    "341": { text: "Adhocracia que evoluciona hacia una Burocracia Profesional y/o Burocracia Maquinal", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/341.png" },
    "342": { text: "Adhocracia que evoluciona hacia una Burocracia Profesional y/o Forma Divisional", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/342.png" },
    "345": { text: "Adhocracia que evoluciona hacia una Burocracia Profesional y/o Organización Misional", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/345.png" },
    "35": { text: "Adhocracia que evoluciona hacia una Organización Misional", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/35.png" },
    "350": { text: "Adhocracia que evoluciona hacia una Organización Misional y/o Estructura Simple", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/350.png" },
    "351": { text: "Adhocracia que evoluciona hacia una Organización Misional y/o Burocracia Maquinal", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/351.png" },
    "352": { text: "Adhocracia que evoluciona hacia una Organización Misional y/o Forma Divisional", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/352.png" },
    "354": { text: "Adhocracia que evoluciona hacia una Organización Misional y/o Burocracia Profesional", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/354.png" },
    "4": { text: "Burocracia Profesional", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/4.png" },
    "40": { text: "Burocracia Profesional que evoluciona hacia una Estructura Simple", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/40.png" },
    "401": { text: "Burocracia Profesional que evoluciona hacia una Estructura Simple y/o Burocracia Maquinal", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/401.png" },
    "402": { text: "Burocracia Profesional que evoluciona hacia una Estructura Simple y/o Forma Divisional", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/402.png" },
    "403": { text: "Burocracia Profesional que evoluciona hacia una Estructura Simple y/o Adhocracia", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/403.png" },
    "405": { text: "Burocracia Profesional que evoluciona hacia una Estructura Simple y/o Organización Misional", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/405.png" },
    "41": { text: "Burocracia Profesional que evoluciona hacia una Burocracia Maquinal", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/41.png" },
    "410": { text: "Burocracia Profesional que evoluciona hacia una Burocracia Maquinal y/o Estructura Simple", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/410.png" },
    "412": { text: "Burocracia Profesional que evoluciona hacia una Burocracia Maquinal y/o Forma Divisional", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/412.png" },
    "413": { text: "Burocracia Profesional que evoluciona hacia una Burocracia Maquinal y/o Adhocracia", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/413.png" },
    "415": { text: "Burocracia Profesional que evoluciona hacia una Burocracia Maquinal y/o Organización Misional", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/415.png" },
    "42": { text: "Burocracia Profesional que evoluciona hacia una Forma Divisional", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/42.png" },
    "420": { text: "Burocracia Profesional que evoluciona hacia una Forma Divisional y/o Estructura Simple", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/420.png" },
    "421": { text: "Burocracia Profesional que evoluciona hacia una Forma Divisional y/o Burocracia Maquinal", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/421.png" },
    "423": { text: "Burocracia Profesional que evoluciona hacia una Forma Divisional y/o Adhocracia", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/423.png" },
    "425": { text: "Burocracia Profesional que evoluciona hacia una Forma Divisional y/o Organización Misional", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/425.png" },
    "43": { text: "Burocracia Profesional que evoluciona hacia una Adhocracia", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/43.png" },
    "430": { text: "Burocracia Profesional que evoluciona hacia una Adhocracia y/o Estructura Simple", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/430.png" },
    "431": { text: "Burocracia Profesional que evoluciona hacia una Adhocracia y/o Burocracia Maquinal", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/431.png" },
    "432": { text: "Burocracia Profesional que evoluciona hacia una Adhocracia y/o Forma Divisional", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/432.png" },
    "435": { text: "Burocracia Profesional que evoluciona hacia una Adhocracia y/o Organización Misional", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/435.png" },
    "45": { text: "Burocracia Profesional que evoluciona hacia una Organización Misional", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/45.png" },
    "450": { text: "Burocracia Profesional que evoluciona hacia una Organización Misional y/o Estructura Simple", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/450.png" },
    "451": { text: "Burocracia Profesional que evoluciona hacia una Organización Misional y/o Burocracia Maquinal", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/451.png" },
    "452": { text: "Burocracia Profesional que evoluciona hacia una Organización Misional y/o Forma Divisional", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/452.png" },
    "453": { text: "Burocracia Profesional que evoluciona hacia una Organización Misional y/o Adhocracia", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/453.png" },
    "5": { text: "Organización Misional", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/5.png" },
    "50": { text: "Organización Misional que evoluciona hacia una Estructura Simple", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/50.png" },
    "501": { text: "Organización Misional que evoluciona hacia una Estructura Simple y/o Burocracia Maquinal", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/501.png" },
    "502": { text: "Organización Misional que evoluciona hacia una Estructura Simple y/o Forma Divisional", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/502.png" },
    "503": { text: "Organización Misional que evoluciona hacia una Estructura Simple y/o Adhocracia", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/503.png" },
    "504": { text: "Organización Misional que evoluciona hacia una Estructura Simple y/o Burocracia Profesional", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/504.png" },
    "51": { text: "Organización Misional que evoluciona hacia una Burocracia Maquinal", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/51.png" },
    "510": { text: "Organización Misional que evoluciona hacia una Burocracia Maquinal y/o Estructura Simple", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/510.png" },
    "512": { text: "Organización Misional que evoluciona hacia una Burocracia Maquinal y/o Forma Divisional", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/512.png" },
    "513": { text: "Organización Misional que evoluciona hacia una Burocracia Maquinal y/o Adhocracia", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/513.png" },
    "514": { text: "Organización Misional que evoluciona hacia una Burocracia Maquinal y/o Burocracia Profesional", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/514.png" },
    "52": { text: "Organización Misional que evoluciona hacia una Forma Divisional", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/52.png" },
    "520": { text: "Organización Misional que evoluciona hacia una Forma Divisional y/o Estructura Simple", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/520.png" },
    "521": { text: "Organización Misional que evoluciona hacia una Forma Divisional y/o Burocracia Maquinal", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/521.png" },
    "523": { text: "Organización Misional que evoluciona hacia una Forma Divisional y/o Adhocracia", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/523.png" },
    "524": { text: "Organización Misional que evoluciona hacia una Forma Divisional y/o Burocracia Profesional", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/524.png" },
    "53": { text: "Organización Misional que evoluciona hacia una Adhocracia", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/53.png" },
    "530": { text: "Organización Misional que evoluciona hacia una Adhocracia y/o Estructura Simple", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/530.png" },
    "531": { text: "Organización Misional que evoluciona hacia una Adhocracia y/o Burocracia Maquinal", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/531.png" },
    "532": { text: "Organización Misional que evoluciona hacia una Adhocracia y/o Forma Divisional", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/532.png" },
    "534": { text: "Organización Misional que evoluciona hacia una Adhocracia y/o Burocracia Profesional", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/534.png" },
    "54": { text: "Organización Misional que evoluciona hacia una Burocracia Profesional", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/54.png" },
    "540": { text: "Organización Misional que evoluciona hacia una Burocracia Profesional y/o Estructura Simple", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/540.png" },
    "541": { text: "Organización Misional que evoluciona hacia una Burocracia Profesional y/o Burocracia Maquinal", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/541.png" },
    "542": { text: "Organización Misional que evoluciona hacia una Burocracia Profesional y/o Forma Divisional", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/542.png" },
    "543": { text: "Organización Misional que evoluciona hacia una Burocracia Profesional y/o Adhocracia", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/543.png" },
    "6": { text: "En la mayoría de las preguntas has seleccionado la opción 'No lo sé'. Vas por mal camino, deberías estudiar algo", urlImage: "https://drive.google.com/file/d/1Eww1oz9wW_yBkQG8uHkWk0c-4oWKEZuR/view" }
  },
  en: {
    "0": { text: "Simple Structure", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/0.png" },
    "01": { text: "Simple Structure evolving towards a Machine Bureaucracy", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/01.png" },
    "012": { text: "Simple Structure evolving towards a Machine Bureaucracy and/or Divisional Form", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/012.png" },
    "013": { text: "Simple Structure evolving towards a Machine Bureaucracy and/or Adhocracy", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/013.png" },
    "014": { text: "Simple Structure evolving towards a Machine Bureaucracy and/or Professional Bureaucracy", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/014.png" },
    "015": { text: "Simple Structure evolving towards a Machine Bureaucracy and/or Missionary Organization", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/015.png" },
    "02": { text: "Simple Structure evolving towards a Divisional Form", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/02.png" },
    "021": { text: "Simple Structure evolving towards a Divisional Form and/or Machine Bureaucracy", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/021.png" },
    "023": { text: "Simple Structure evolving towards a Divisional Form and/or Adhocracy", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/023.png" },
    "024": { text: "Simple Structure evolving towards a Divisional Form and/or Professional Bureaucracy", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/024.png" },
    "025": { text: "Simple Structure evolving towards a Divisional Form and/or Missionary Organization", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/025.png" },
    "03": { text: "Simple Structure evolving towards an Adhocracy", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/03.png" },
    "031": { text: "Simple Structure evolving towards an Adhocracy and/or Machine Bureaucracy", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/031.png" },
    "032": { text: "Simple Structure evolving towards an Adhocracy and/or Divisional Form", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/032.png" },
    "034": { text: "Simple Structure evolving towards an Adhocracy and/or Professional Bureaucracy", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/034.png" },
    "035": { text: "Simple Structure evolving towards an Adhocracy and/or Missionary Organization", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/035.png" },
    "04": { text: "Simple Structure evolving towards a Professional Bureaucracy", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/04.png" },
    "041": { text: "Simple Structure evolving towards a Professional Bureaucracy and/or Machine Bureaucracy", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/041.png" },
    "042": { text: "Simple Structure evolving towards a Professional Bureaucracy and/or Divisional Form", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/042.png" },
    "043": { text: "Simple Structure evolving towards a Professional Bureaucracy and/or Adhocracy", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/043.png" },
    "045": { text: "Simple Structure evolving towards a Professional Bureaucracy and/or Missionary Organization", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/045.png" },
    "05": { text: "Simple Structure evolving towards a Missionary Organization", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/05.png" },
    "051": { text: "Simple Structure evolving towards a Missionary Organization and/or Machine Bureaucracy", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/051.png" },
    "052": { text: "Simple Structure evolving towards a Missionary Organization and/or Divisional Form", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/052.png" },
    "053": { text: "Simple Structure evolving towards a Missionary Organization and/or Adhocracy", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/053.png" },
    "054": { text: "Simple Structure evolving towards a Missionary Organization and/or Professional Bureaucracy", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/054.png" },
    "1": { text: "Machine Bureaucracy", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/1.png" },
    "10": { text: "Machine Bureaucracy evolving towards a Simple Structure", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/10.png" },
    "102": { text: "Machine Bureaucracy evolving towards a Simple Structure and/or Divisional Form", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/102.png" },
    "103": { text: "Machine Bureaucracy evolving towards a Simple Structure and/or Adhocracy", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/103.png" },
    "104": { text: "Machine Bureaucracy evolving towards a Simple Structure and/or Professional Bureaucracy", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/104.png" },
    "105": { text: "Machine Bureaucracy evolving towards a Simple Structure and/or Missionary Organization", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/105.png" },
    "12": { text: "Machine Bureaucracy evolving towards a Divisional Form", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/12.png" },
    "120": { text: "Machine Bureaucracy evolving towards a Divisional Form and/or Simple Structure", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/120.png" },
    "123": { text: "Machine Bureaucracy evolving towards a Divisional Form and/or Adhocracy", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/123.png" },
    "124": { text: "Machine Bureaucracy evolving towards a Divisional Form and/or Professional Bureaucracy", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/124.png" },
    "125": { text: "Machine Bureaucracy evolving towards a Divisional Form and/or Missionary Organization", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/125.png" },
    "13": { text: "Machine Bureaucracy evolving towards an Adhocracy", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/13.png" },
    "130": { text: "Machine Bureaucracy evolving towards an Adhocracy and/or Simple Structure", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/130.png" },
    "132": { text: "Machine Bureaucracy evolving towards an Adhocracy and/or Divisional Form", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/132.png" },
    "134": { text: "Machine Bureaucracy evolving towards an Adhocracy and/or Professional Bureaucracy", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/134.png" },
    "135": { text: "Machine Bureaucracy evolving towards an Adhocracy and/or Missionary Organization", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/135.png" },
    "14": { text: "Machine Bureaucracy evolving towards a Professional Bureaucracy", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/14.png" },
    "140": { text: "Machine Bureaucracy evolving towards a Professional Bureaucracy and/or Simple Structure", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/140.png" },
    "142": { text: "Machine Bureaucracy evolving towards a Professional Bureaucracy and/or Divisional Form", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/142.png" },
    "143": { text: "Machine Bureaucracy evolving towards a Professional Bureaucracy and/or Adhocracy", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/143.png" },
    "145": { text: "Machine Bureaucracy evolving towards a Professional Bureaucracy and/or Missionary Organization", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/145.png" },
    "15": { text: "Machine Bureaucracy evolving towards a Missionary Organization", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/15.png" },
    "150": { text: "Machine Bureaucracy evolving towards a Missionary Organization and/or Simple Structure", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/150.png" },
    "152": { text: "Machine Bureaucracy evolving towards a Missionary Organization and/or Divisional Form", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/152.png" },
    "153": { text: "Machine Bureaucracy evolving towards a Missionary Organization and/or Adhocracy", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/153.png" },
    "154": { text: "Machine Bureaucracy evolving towards a Missionary Organization and/or Professional Bureaucracy", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/154.png" },
    "2": { text: "Divisional Form", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/2.png" },
    "20": { text: "Divisional Form evolving towards a Simple Structure", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/20.png" },
    "201": { text: "Divisional Form evolving towards a Simple Structure and/or Machine Bureaucracy", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/201.png" },
    "203": { text: "Divisional Form evolving towards a Simple Structure and/or Adhocracy", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/203.png" },
    "204": { text: "Divisional Form evolving towards a Simple Structure and/or Professional Bureaucracy", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/204.png" },
    "205": { text: "Divisional Form evolving towards a Simple Structure and/or Missionary Organization", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/205.png" },
    "21": { text: "Divisional Form evolving towards a Machine Bureaucracy", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/21.png" },
    "210": { text: "Divisional Form evolving towards a Machine Bureaucracy and/or Simple Structure", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/210.png" },
    "213": { text: "Divisional Form evolving towards a Machine Bureaucracy and/or Adhocracy", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/213.png" },
    "214": { text: "Divisional Form evolving towards a Machine Bureaucracy and/or Professional Bureaucracy", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/214.png" },
    "215": { text: "Divisional Form evolving towards a Machine Bureaucracy and/or Missionary Organization", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/215.png" },
    "23": { text: "Divisional Form evolving towards an Adhocracy", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/23.png" },
    "230": { text: "Divisional Form evolving towards an Adhocracy and/or Simple Structure", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/230.png" },
    "231": { text: "Divisional Form evolving towards an Adhocracy and/or Machine Bureaucracy", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/231.png" },
    "234": { text: "Divisional Form evolving towards an Adhocracy and/or Professional Bureaucracy", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/234.png" },
    "235": { text: "Divisional Form evolving towards an Adhocracy and/or Missionary Organization", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/235.png" },
    "24": { text: "Divisional Form evolving towards a Professional Bureaucracy", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/24.png" },
    "240": { text: "Divisional Form evolving towards a Professional Bureaucracy and/or Simple Structure", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/240.png" },
    "241": { text: "Divisional Form evolving towards a Professional Bureaucracy and/or Machine Bureaucracy", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/241.png" },
    "243": { text: "Divisional Form evolving towards a Professional Bureaucracy and/or Adhocracy", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/243.png" },
    "245": { text: "Divisional Form evolving towards a Professional Bureaucracy and/or Missionary Organization", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/245.png" },
    "25": { text: "Divisional Form evolving towards a Missionary Organization", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/25.png" },
    "250": { text: "Divisional Form evolving towards a Missionary Organization and/or Simple Structure", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/250.png" },
    "251": { text: "Divisional Form evolving towards a Missionary Organization and/or Machine Bureaucracy", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/251.png" },
    "253": { text: "Divisional Form evolving towards a Missionary Organization and/or Adhocracy", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/253.png" },
    "254": { text: "Divisional Form evolving towards a Missionary Organization and/or Professional Bureaucracy", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/254.png" },
    "3": { text: "Adhocracy", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/3.png" },
    "30": { text: "Adhocracy evolving towards a Simple Structure", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/30.png" },
    "301": { text: "Adhocracy evolving towards a Simple Structure and/or Machine Bureaucracy", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/301.png" },
    "302": { text: "Adhocracy evolving towards a Simple Structure and/or Divisional Form", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/302.png" },
    "304": { text: "Adhocracy evolving towards a Simple Structure and/or Professional Bureaucracy", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/304.png" },
    "305": { text: "Adhocracy evolving towards a Simple Structure and/or Missionary Organization", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/305.png" },
    "31": { text: "Adhocracy evolving towards a Machine Bureaucracy", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/31.png" },
    "310": { text: "Adhocracy evolving towards a Machine Bureaucracy and/or Simple Structure", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/310.png" },
    "312": { text: "Adhocracy evolving towards a Machine Bureaucracy and/or Divisional Form", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/312.png" },
    "314": { text: "Adhocracy evolving towards a Machine Bureaucracy and/or Professional Bureaucracy", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/314.png" },
    "315": { text: "Adhocracy evolving towards a Machine Bureaucracy and/or Missionary Organization", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/315.png" },
    "32": { text: "Adhocracy evolving towards a Divisional Form", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/32.png" },
    "320": { text: "Adhocracy evolving towards a Divisional Form and/or Simple Structure", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/320.png" },
    "321": { text: "Adhocracy evolving towards a Divisional Form and/or Machine Bureaucracy", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/321.png" },
    "324": { text: "Adhocracy evolving towards a Divisional Form and/or Professional Bureaucracy", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/324.png" },
    "325": { text: "Adhocracy evolving towards a Divisional Form and/or Missionary Organization", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/325.png" },
    "34": { text: "Adhocracy evolving towards a Professional Bureaucracy", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/34.png" },
    "340": { text: "Adhocracy evolving towards a Professional Bureaucracy and/or Simple Structure", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/340.png" },
    "341": { text: "Adhocracy evolving towards a Professional Bureaucracy and/or Machine Bureaucracy", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/341.png" },
    "342": { text: "Adhocracy evolving towards a Professional Bureaucracy and/or Divisional Form", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/342.png" },
    "345": { text: "Adhocracy evolving towards a Professional Bureaucracy and/or Missionary Organization", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/345.png" },
    "35": { text: "Adhocracy evolving towards a Missionary Organization", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/35.png" },
    "350": { text: "Adhocracy evolving towards a Missionary Organization and/or Simple Structure", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/350.png" },
    "351": { text: "Adhocracy evolving towards a Missionary Organization and/or Machine Bureaucracy", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/351.png" },
    "352": { text: "Adhocracy evolving towards a Missionary Organization and/or Divisional Form", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/352.png" },
    "354": { text: "Adhocracy evolving towards a Missionary Organization and/or Professional Bureaucracy", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/354.png" },
    "4": { text: "Professional Bureaucracy", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/4.png" },
    "40": { text: "Professional Bureaucracy evolving towards a Simple Structure", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/40.png" },
    "401": { text: "Professional Bureaucracy evolving towards a Simple Structure and/or Machine Bureaucracy", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/401.png" },
    "402": { text: "Professional Bureaucracy evolving towards a Simple Structure and/or Divisional Form", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/402.png" },
    "403": { text: "Professional Bureaucracy evolving towards a Simple Structure and/or Adhocracy", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/403.png" },
    "405": { text: "Professional Bureaucracy evolving towards a Simple Structure and/or Missionary Organization", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/405.png" },
    "41": { text: "Professional Bureaucracy evolving towards a Machine Bureaucracy", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/41.png" },
    "410": { text: "Professional Bureaucracy evolving towards a Machine Bureaucracy and/or Simple Structure", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/410.png" },
    "412": { text: "Professional Bureaucracy evolving towards a Machine Bureaucracy and/or Divisional Form", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/412.png" },
    "413": { text: "Professional Bureaucracy evolving towards a Machine Bureaucracy and/or Adhocracy", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/413.png" },
    "415": { text: "Professional Bureaucracy evolving towards a Machine Bureaucracy and/or Missionary Organization", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/415.png" },
    "42": { text: "Professional Bureaucracy evolving towards a Divisional Form", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/42.png" },
    "420": { text: "Professional Bureaucracy evolving towards a Divisional Form and/or Simple Structure", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/420.png" },
    "421": { text: "Professional Bureaucracy evolving towards a Divisional Form and/or Machine Bureaucracy", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/421.png" },
    "423": { text: "Professional Bureaucracy evolving towards a Divisional Form and/or Adhocracy", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/423.png" },
    "425": { text: "Professional Bureaucracy evolving towards a Divisional Form and/or Missionary Organization", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/425.png" },
    "43": { text: "Professional Bureaucracy evolving towards an Adhocracy", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/43.png" },
    "430": { text: "Professional Bureaucracy evolving towards an Adhocracy and/or Simple Structure", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/430.png" },
    "431": { text: "Professional Bureaucracy evolving towards an Adhocracy and/or Machine Bureaucracy", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/431.png" },
    "432": { text: "Professional Bureaucracy evolving towards an Adhocracy and/or Divisional Form", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/432.png" },
    "435": { text: "Professional Bureaucracy evolving towards an Adhocracy and/or Missionary Organization", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/435.png" },
    "45": { text: "Professional Bureaucracy evolving towards a Missionary Organization", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/45.png" },

    "450": { text: "Professional Bureaucracy evolving towards a Missionary Organization and/or Simple Structure", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/450.png" },

    "451": { text: "Professional Bureaucracy evolving towards a Missionary Organization and/or Machine Bureaucracy", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/451.png" },

    "452": { text: "Professional Bureaucracy evolving towards a Missionary Organization and/or Divisional Form", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/452.png" },

    "453": { text: "Professional Bureaucracy evolving towards a Missionary Organization and/or Adhocracy", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/453.png" },

    "5": { text: "Missionary Organization", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/5.png" },

    "50": { text: "Missionary Organization evolving towards a Simple Structure", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/50.png" },

    "501": { text: "Missionary Organization evolving towards a Simple Structure and/or Machine Bureaucracy", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/501.png" },

    "502": { text: "Missionary Organization evolving towards a Simple Structure and/or Divisional Form", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/502.png" },

    "503": { text: "Missionary Organization evolving towards a Simple Structure and/or Adhocracy", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/503.png" },

    "504": { text: "Missionary Organization evolving towards a Simple Structure and/or Professional Bureaucracy", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/504.png" },

    "51": { text: "Missionary Organization evolving towards a Machine Bureaucracy", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/51.png" },

    "510": { text: "Missionary Organization evolving towards a Machine Bureaucracy and/or Simple Structure", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/510.png" },

    "512": { text: "Missionary Organization evolving towards a Machine Bureaucracy and/or Divisional Form", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/512.png" },

    "513": { text: "Missionary Organization evolving towards a Machine Bureaucracy and/or Adhocracy", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/513.png" },

    "514": { text: "Missionary Organization evolving towards a Machine Bureaucracy and/or Professional Bureaucracy", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/514.png" },

    "52": { text: "Missionary Organization evolving towards a Divisional Form", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/52.png" },

    "520": { text: "Missionary Organization evolving towards a Divisional Form and/or Simple Structure", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/520.png" },

    "521": { text: "Missionary Organization evolving towards a Divisional Form and/or Machine Bureaucracy", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/521.png" },

    "523": { text: "Missionary Organization evolving towards a Divisional Form and/or Adhocracy", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/523.png" },

    "524": { text: "Missionary Organization evolving towards a Divisional Form and/or Professional Bureaucracy", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/524.png" },

    "53": { text: "Missionary Organization evolving towards an Adhocracy", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/53.png" },

    "530": { text: "Missionary Organization evolving towards an Adhocracy and/or Simple Structure", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/530.png" },

    "531": { text: "Missionary Organization evolving towards an Adhocracy and/or Machine Bureaucracy", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/531.png" },

    "532": { text: "Missionary Organization evolving towards an Adhocracy and/or Divisional Form", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/532.png" },

    "534": { text: "Missionary Organization evolving towards an Adhocracy and/or Professional Bureaucracy", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/534.png" },

    "54": { text: "Missionary Organization evolving towards a Professional Bureaucracy", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/54.png" },

    "540": { text: "Missionary Organization evolving towards a Professional Bureaucracy and/or Simple Structure", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/540.png" },

    "541": { text: "Missionary Organization evolving towards a Professional Bureaucracy and/or Machine Bureaucracy", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/541.png" },

    "542": { text: "Missionary Organization evolving towards a Professional Bureaucracy and/or Divisional Form", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/542.png" },

    "543": { text: "Missionary Organization evolving towards a Professional Bureaucracy and/or Adhocracy", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/543.png" },

    "6": { text: "In most of the questions you selected the option \"I don't know\". You are on the wrong track, you should study something", urlImage: "https://www.ugr.es/local/calbacet/imagenesot/6.png" }
  }
}
  