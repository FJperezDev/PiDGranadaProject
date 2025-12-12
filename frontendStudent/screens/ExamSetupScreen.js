import { Text, View, StyleSheet, Platform, ScrollView } from "react-native";
import { StyledButton } from "../components/StyledButton";
import { useLanguage } from "../context/LanguageContext";
import { useEffect, useState } from "react";
import { StyledTextInput } from "../components/StyledTextInput";
import { CheckSquare, Square } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import { mockApi } from "../services/api";
import { COLORS } from "../constants/colors";
import { useVoiceControl } from "../context/VoiceContext";
import { useIsFocused } from "@react-navigation/native";

export const ExamSetupScreen = ({ route, setAlert }) => {
  const { t, language } = useLanguage();
  const { transcript, setTranscript } = useVoiceControl();
  const isFocused = useIsFocused();
  const [ topics, setTopics ] = useState([]);
  const [selectedTopics, setSelectedTopics] = useState({});
  const [numQuestions, setNumQuestions] = useState(10);
  const navigation = useNavigation();
  const { code } = route.params;

  const normalizeText = (text) => {
    return text ? text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim() : "";
  };

  useEffect(() => {
    if (!transcript || !isFocused) return;

    const spoken = normalizeText(transcript);
    console.log("Comando oído en Setup:", spoken);

    // --- A. Generar Examen ---
    if (
        spoken.includes('generar') || 
        spoken.includes('crear') || 
        spoken.includes('empezar') || 
        spoken.includes('generate') || 
        spoken.includes('start')
    ) {
        handleGenerate();
        setTranscript('');
        return;
    }

    // --- B. Navegación General ---
    if (spoken.includes('volver') || spoken.includes('atras') || spoken.includes('back')) {
        if (navigation.canGoBack()) navigation.goBack();
        setTranscript('');
        return;
    }
    if (spoken.includes('inicio') || spoken.includes('home')) {
        navigation.navigate('Home');
        setTranscript('');
        return;
    }

    // --- C. Detectar Números (Para cambiar cantidad de preguntas) ---
    // Buscamos si hay dígitos en el comando (ej: "quiero 20 preguntas")
    const numberMatch = spoken.match(/\d+/); 
    if (numberMatch) {
        const num = parseInt(numberMatch[0], 10);
        if (!isNaN(num) && num > 0 && num <= 100) { // Ponemos un límite razonable
            setNumQuestions(num);
            // No hacemos return aquí para permitir decir "tema 1 y 20 preguntas" a la vez si quisieras
        }
    }

    // --- D. Seleccionar/Deseleccionar Temas ---
    if (topics.length > 0) {
        // Buscamos si lo dicho coincide con algún título de tema
        const matchedTopic = topics.find(topic => {
            const normalizedTitle = normalizeText(topic.title);
            return spoken.includes(normalizedTitle) || normalizedTitle.includes(spoken);
        });

        if (matchedTopic) {
            toggleTopic(matchedTopic.id);
            setTranscript('');
            return;
        }
        
        // Opción extra: "Todos" o "Ninguno"
        if (spoken.includes('todos') || spoken.includes('all')) {
            const allSelected = topics.reduce((acc, t) => ({...acc, [t.id]: true}), {});
            setSelectedTopics(allSelected);
            setTranscript('');
        }
    }

  }, [transcript, isFocused, topics, navigation]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await mockApi.getTopics(code);
        const transformedTopics = response.map(topic => ({
            ...topic,
            id: topic.order_id 
        }));
        setTopics(transformedTopics);

        const initialSelected = transformedTopics.reduce(
          (acc, topic) => ({ ...acc, [topic.id]: false }),
          {}
        );
        setSelectedTopics(initialSelected);
      } catch (error) {
        console.error("Error actualizando los datos de la asignatura: ", error);
      }
    };

    fetchData();
  }, [language, code]);

  const toggleTopic = (topicId) => {
    setSelectedTopics((prev) => ({ ...prev, [topicId]: !prev[topicId] }));
  };

  const handleGenerate = () => {
    const selected = Object.keys(selectedTopics).filter((id) => selectedTopics[id]);

    if (selected.length === 0) {
      setAlert?.({ title: t("error"), message: t("errorMinTopics") });
      return;
    }

    const nQuestions = parseInt(numQuestions, 10);
    if (isNaN(nQuestions) || nQuestions <= 0) {
      setAlert?.({ title: t("error"), message: t("errorInvalidQuestions") });
      return;
    }

    // Filtrar los topics seleccionados
    const chosenTopics = topics.filter((t) => selected.includes(String(t.id)));

    navigation.navigate("Exam", {
      topics: chosenTopics,
      nQuestions,
      code: code,
    });
  };

  if(!topics.length) return (
    <View style={styles.container}></View>
  )

  return (
    <View style={styles.container}>
      {/* Contenido principal */}
      <View style={styles.scrollArea}>
        <Text style={styles.sectionTitle}>{t("selectTopics")}</Text>

        <ScrollView style={{ maxHeight: 450, marginBottom: 20 }}>
          {topics.map((topic) => (
            <StyledButton
              key={topic.id}
              onPress={() => toggleTopic(topic.id)}
              style={styles.topicButton}
            >
              {selectedTopics[topic.id] ? (
                <CheckSquare size={24} color={COLORS.primary} /> // cyan-500
              ) : (
                <Square size={24} color={COLORS.textLight} /> // slate-400
              )}
              <Text style={styles.topicText}>{topic.title}</Text>
            </StyledButton>
          ))}
        </ScrollView>

        <Text style={styles.sectionTitle}>{t("numQuestions")}</Text>

        <StyledTextInput
          placeholder="10"
          value={numQuestions}
          onChange={setNumQuestions}
          type="number"
        />
      </View>

      {/* Footer con botones */}
      <View style={styles.footer}>
        <View></View>
        <StyledButton
          title={t("generateExam")}
          onPress={handleGenerate}
          style={styles.generateButton}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    maxWidth: 700,
    alignSelf: "center",
    padding: 20,
    backgroundColor: COLORS.background,
  },
  scrollArea: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginVertical: 16,
    color: COLORS.text,
  },
  topicButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.borderLight, // slate-200
    borderRadius: 8,
    padding: 16,
    marginBottom: 10,
    ...(Platform.OS === 'web'
      ? { boxShadow: '0px 1px 3px rgba(0,0,0,0.05)' }
      : {
          shadowColor: COLORS.shadow,
          shadowOpacity: 0.05,
          shadowRadius: 3,
          elevation: 1,
        }),
  },
  topicText: {
    fontSize: 16,
    marginLeft: 12,
    color: COLORS.text,
  },
  input: {
    width: "100%",
    maxWidth: 200,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    paddingTop: 16,
    marginTop: 20,
  },
  generateButton: {
    backgroundColor: COLORS.primaryLight,
  },
});
