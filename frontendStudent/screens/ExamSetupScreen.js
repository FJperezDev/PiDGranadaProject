import React, { useEffect, useState } from "react";
import { 
  Text, 
  View, 
  StyleSheet, 
  Platform, 
  ScrollView, 
  KeyboardAvoidingView, 
  TouchableWithoutFeedback, 
  Keyboard 
} from "react-native";
import { StyledButton } from "../components/StyledButton";
import { useLanguage } from "../context/LanguageContext";
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
  const [topics, setTopics] = useState([]);
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

    // --- C. Detectar Números ---
    const numberMatch = spoken.match(/\d+/); 
    if (numberMatch) {
        const num = parseInt(numberMatch[0], 10);
        if (!isNaN(num) && num > 0 && num <= 100) { 
            setNumQuestions(num);
        }
    }

    // --- D. Seleccionar/Deseleccionar Temas ---
    if (topics.length > 0) {
        const matchedTopic = topics.find(topic => {
            const normalizedTitle = normalizeText(topic.title);
            return spoken.includes(normalizedTitle) || normalizedTitle.includes(spoken);
        });

        if (matchedTopic) {
            toggleTopic(matchedTopic.id);
            setTranscript('');
            return;
        }
        
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
    // 1. Evita que el teclado tape el contenido
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {/* 2. Cierra el teclado al tocar fuera */}
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          <View style={styles.content}>
            <Text style={styles.title}>{t("selectTopics")}</Text>

            <ScrollView 
              style={styles.listContainer} 
              showsVerticalScrollIndicator={false}
              // 3. Permite hacer click en los botones de temas incluso con el teclado abierto
              keyboardShouldPersistTaps="handled"
            >
              {topics.map((topic) => {
                 const isSelected = selectedTopics[topic.id];
                 return (
                  <StyledButton
                    key={topic.id}
                    onPress={() => toggleTopic(topic.id)}
                    variant={isSelected ? "secondary" : "ghost"}
                    style={[
                      styles.topicButton, 
                      isSelected && styles.topicSelected
                    ]}
                  >
                    <View style={styles.topicRow}>
                        {isSelected ? (
                          <CheckSquare size={24} color={COLORS.primary} />
                        ) : (
                          <Square size={24} color={COLORS.textLight} />
                        )}
                        <Text style={[styles.topicText, isSelected && styles.topicTextSelected]}>
                            {topic.title}
                        </Text>
                    </View>
                  </StyledButton>
                );
              })}
            </ScrollView>

            <View style={styles.settingRow}>
                <Text style={styles.label}>{t("numQuestions")}</Text>
                <StyledTextInput
                  value={String(numQuestions)}
                  onChangeText={setNumQuestions}
                  keyboardType="numeric"
                  style={styles.numberInput}
                  // Cierra el teclado al pulsar "Intro" en el teclado
                  returnKeyType="done"
                  onSubmitEditing={Keyboard.dismiss}
                />
            </View>
          </View>

          <View style={styles.footer}>
            <StyledButton
              title={t("generateExam")}
              onPress={handleGenerate}
              variant="primary"
              size="large"
              style={{ width: '100%' }}
            />
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    width: '100%',
    maxWidth: 700,
    alignSelf: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 20,
  },
  listContainer: {
    flex: 1,
    marginBottom: 20,
  },
  topicButton: {
    marginBottom: 10,
    justifyContent: 'flex-start',
    paddingHorizontal: 16,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  topicSelected: {
    backgroundColor: COLORS.primaryVeryLight,
    borderColor: COLORS.primary,
  },
  topicRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%'
  },
  topicText: {
    fontSize: 16,
    marginLeft: 12,
    color: COLORS.textSecondary,
    flex: 1, 
  },
  topicTextSelected: {
    color: COLORS.text,
    fontWeight: '600'
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  numberInput: {
    width: 80,
    textAlign: 'center',
    paddingVertical: 8,
  },
  footer: {
    padding: 20,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    alignItems: 'center'
  },
});