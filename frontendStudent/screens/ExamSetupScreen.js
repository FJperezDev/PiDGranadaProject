import { Text, View, StyleSheet, Platform } from "react-native";
import { StyledButton } from "../components/StyledButton";
import { useLanguage } from "../context/LanguageContext";
import { useEffect, useState } from "react";
import { StyledTextInput } from "../components/StyledTextInput";
import { CheckSquare, Square } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import { mockApi } from "../services/api";

export const ExamSetupScreen = ({ route, setAlert }) => {
  const { t, language } = useLanguage();
  const [ topics, setTopics ] = useState([]);
  const [selectedTopics, setSelectedTopics] = useState({});
  const [numQuestions, setNumQuestions] = useState(10);
  const navigation = useNavigation();
  const { code } = route.params;

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

        {topics.map((topic) => (
          <StyledButton
            key={topic.id}
            onPress={() => toggleTopic(topic.id)}
            style={styles.topicButton}
          >
            {selectedTopics[topic.id] ? (
              <CheckSquare size={24} color="#06b6d4" /> // cyan-500
            ) : (
              <Square size={24} color="#94a3b8" /> // slate-400
            )}
            <Text style={styles.topicText}>{topic.title}</Text>
          </StyledButton>
        ))}

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
    backgroundColor: "#f9fafb",
  },
  scrollArea: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginVertical: 16,
    color: "#000",
  },
  topicButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e2e8f0", // slate-200
    borderRadius: 8,
    padding: 16,
    marginBottom: 10,
    ...(Platform.OS === 'web'
      ? { boxShadow: '0px 1px 3px rgba(0,0,0,0.05)' }
      : {
          shadowColor: "#000",
          shadowOpacity: 0.05,
          shadowRadius: 3,
          elevation: 1,
        }),
  },
  topicText: {
    fontSize: 16,
    marginLeft: 12,
    color: "#000",
  },
  input: {
    width: "100%",
    maxWidth: 200,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#cbd5e1", // slate-300
    paddingTop: 16,
    marginTop: 20,
  },
  generateButton: {
    backgroundColor: "#a5f3fc", // cyan-200
  },
});
