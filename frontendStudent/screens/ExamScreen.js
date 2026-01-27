import { useLanguage } from "../context/LanguageContext";
import { useState, useEffect, useRef } from "react";
import { mockApi } from "../services/api";
import { StyledButton } from "../components/StyledButton";
import { Text, View, StyleSheet, Alert } from "react-native";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import { COLORS } from "../constants/colors";
import { useVoiceControl } from "../context/VoiceContext";

export const ExamScreen = ({ route }) => {
  const { t, language } = useLanguage();
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const { code, topics, nQuestions } = route.params;
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [currentQ, setCurrentQ] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [timeLeft, setTimeLeft] = useState(nQuestions * 90);
  const isInitialMount = useRef(true);

  const { transcript, setTranscript } = useVoiceControl();

  const normalizeText = (text) => {
    return text ? text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim() : "";
  };

  useEffect(() => {
    if (!transcript || !isFocused) return; 

    const spoken = normalizeText(transcript);
    
    const cmdNext = language === 'en' ? 'next' : 'siguiente';
    const cmdPrev = language === 'en' ? 'previous' : 'anterior';
    const cmdFinish = language === 'en' ? 'finish' : 'finalizar';

    if (spoken.includes(cmdNext)) {
        handleNext();
        setTranscript('');
        return;
    }
    if (spoken.includes(cmdPrev)) {
        handlePrev();
        setTranscript('');
        return;
    }
    if (spoken.includes(cmdFinish)) {
        handleFinish();
        setTranscript('');
        return;
    }

    if (questions.length > 0) {
      const currentQuestion = questions[currentQ];
      const match = currentQuestion.answers.find(opt => {
          const normOpt = normalizeText(opt.text);
          return spoken.includes(normOpt) || normOpt.includes(spoken);
      });

      if (match) {
        handleSelectAnswer(currentQuestion.id, match.id);
        setTranscript('');
      }
    }
    
  }, [transcript, currentQ, questions, language]);

  useEffect(() => {
    setIsLoading(true);
    mockApi.generateExam(topics, nQuestions).then((data) => {
      setQuestions(data);
      setIsLoading(false);
    }).catch((error) => {
      console.error("Error generating exam:", error);
      setIsLoading(false);
    });
  }, [topics, nQuestions]);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    if (questions.length === 0) return;

    const translateQuestions = async () => {
      setIsLoading(true);
      const translationPromises = questions.map(q => mockApi.getQuestion(q.id));
      const translatedQuestions = await Promise.all(translationPromises);
      setQuestions(translatedQuestions);
      setIsLoading(false);
    };

    translateQuestions();
  }, [language]);

  const handleFinish = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const result = await mockApi.evaluateExam(code, answers);
      navigation.replace("ExamResult", {
        code: code,
        score: result.mark,
        total: questions.length,
        recommendations: result.recommendations,
        questions: questions,
        userAnswers: answers,
      });

    } catch (error) {
      Alert.alert(
        t("error"), 
        t("errorConnection")
      );
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (isLoading || isSubmitting) return;

    if (timeLeft <= 0) {
      handleFinish();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isLoading, isSubmitting]);

  const handleSelectAnswer = (questionId, answer) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const handleNext = () => {
    if (currentQ < questions.length - 1) {
      setCurrentQ(currentQ + 1);
    }
    if (currentQ === questions.length -1 ) {
      handleFinish();
    }
  };

  const handlePrev = () => {
    if (currentQ > 0) {
      setCurrentQ(currentQ - 1);
    }
  };

  if (isLoading || !questions.length) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>{t("generatingExam")}</Text>
      </View>
    );
  }

  const question = questions[currentQ];
  if (!question) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>{t("loading")}</Text>
      </View>
    );
  }

  const selectedAnswer = answers[question.id];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.progressText}>{`${currentQ + 1} / ${questions.length}`}</Text>
        <Text style={styles.timerText}>
          {`${t("timeRemaining")}: ${Math.floor(timeLeft / 60)}:${(
            "0" + (timeLeft % 60)
          ).slice(-2)}`}
        </Text>
      </View>

      <Text style={styles.questionText}>{question.statement}</Text>

      <View style={styles.optionsContainer}>
        {question.answers.map((opt) => {
          const isSelected = selectedAnswer === opt.id;
          
          return (
            <StyledButton
              key={opt.id}
              onPress={() => handleSelectAnswer(question.id, opt.id)}
              // Usamos variantes para manejar el estado visual
              variant={isSelected ? "primary" : "secondary"}
              style={[
                styles.optionButton,
                isSelected ? styles.selectedBorder : null
              ]}
              textStyle={{ 
                textAlign: "center", 
                // El color del texto ya lo maneja StyledButton internamente según la variante
              }}
            >
              <Text style={{ 
                  textAlign: "center", 
                  fontSize: 16,
                  color: isSelected ? COLORS.text : COLORS.textSecondary 
              }}>
                  {opt.text}
              </Text>
            </StyledButton>
          );
        })}
      </View>

      <View style={styles.navContainer}>
        {/* Botón Anterior - Outline o Ghost para menor jerarquía */}
        <StyledButton
          title={t("previous")}
          onPress={handlePrev}
          disabled={currentQ === 0}
          variant="ghost" 
          style={{ width: '30%' }}
        />
        
        {/* Botón Siguiente/Finalizar - Primary o Success para acción principal */}
        <StyledButton
          title={currentQ === questions.length - 1 ? t("finishExam") : t("next")}
          onPress={currentQ === questions.length - 1 ? handleFinish : handleNext}
          variant={currentQ === questions.length - 1 ? "success" : "primary"}
          style={{ width: '40%' }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    width: "100%",
    maxWidth: 700,
    alignSelf: "center",
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.text,
  },
  header: {
    position: "absolute",
    top: 80,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  progressText: {
    color: COLORS.textSecondary,
  },
  timerText: {
    color: COLORS.errorDark,
    fontWeight: "bold",
    fontSize: 18,
  },
  questionText: {
    fontSize: 22,
    fontWeight: "700", // Más peso para legibilidad
    textAlign: "center",
    marginVertical: 32,
    color: COLORS.text,
    lineHeight: 30,
  },
  optionsContainer: {
    width: "100%",
    gap: 12, // Espacio uniforme entre opciones
  },
  optionButton: {
    width: "100%",
    justifyContent: 'center',
    paddingVertical: 16,
    // Quitamos estilos manuales de borde/color porque lo hace el StyledButton
  },
  selectedBorder: {
     borderColor: COLORS.primary, // Refuerzo visual
     borderWidth: 2
  },
  navContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 40,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight
  },
});