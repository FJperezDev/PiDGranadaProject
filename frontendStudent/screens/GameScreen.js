import { useState, useEffect } from 'react';
import { Text, View, StyleSheet, ScrollView } from "react-native";
import { useNavigation } from '@react-navigation/native';
import { useLanguage } from "../context/LanguageContext";
import { StyledButton } from "../components/StyledButton";
import { GAME_QUESTIONS } from "../constants/game";
import { useIsFocused } from "@react-navigation/native";
import { useVoiceControl } from "../context/VoiceContext";
import { COLORS } from "../constants/colors";

export const GameScreen = () => {
  const navigation = useNavigation();
  const { language, t } = useLanguage();
  const isFocused = useIsFocused();
  const { transcript, setTranscript } = useVoiceControl();
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [currentQ, setCurrentQ] = useState(0);
  const [warning, setWarning] = useState("");

  const normalizeText = (text) => {
    return text ? text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim() : "";
  };

  useEffect(() => {
    if (!transcript || !isFocused || questions.length === 0) return;

    const spoken = normalizeText(transcript);
    
    if (spoken.includes('siguiente') || spoken.includes('next') || spoken.includes('continuar')) {
        handleNext();
        setTranscript('');
        return;
    }

    if (
        spoken.includes('anterior') || 
        spoken.includes('previous') || 
        spoken.includes('atras') || 
        spoken.includes('volver') || 
        spoken.includes('back')
    ) {
        if (currentQ > 0) {
            handlePrev();
        } else {
            if (navigation.canGoBack()) {
                navigation.goBack();
            } else {
                navigation.navigate('Home');
            }
        }
        setTranscript('');
        return;
    }
    
    if (spoken.includes('terminar') || spoken.includes('finalizar') || spoken.includes('finish')) {
        if (currentQ === questions.length - 1) {
            handleNext();
        }
        setTranscript('');
        return;
    }

    if (spoken.includes('inicio') || spoken.includes('home') || spoken.includes('salir')) {
        navigation.navigate('Home');
        setTranscript('');
        return;
    }

    const currentQuestion = questions[currentQ];
    if (currentQuestion) {
        const match = currentQuestion.options.find(opt => {
            const normalizedOpt = normalizeText(opt.text);
            return spoken.includes(normalizedOpt) || normalizedOpt.includes(spoken);
        });

        if (match) {
            handleSelectAnswer(currentQuestion.id, match.code);
            setTranscript('');
        }
    }

  }, [transcript, isFocused, questions, currentQ]);

  useEffect(() => {
    setQuestions(GAME_QUESTIONS[language] || GAME_QUESTIONS["es"]);
  }, [language]);

  const handleSelectAnswer = (questionId, answerCode) => {
    setAnswers(prev => ({ ...prev, [questionId]: answerCode }));
    setWarning("");
  };

  const handleNext = () => {
    const question = questions[currentQ];
    if (answers[question.id] === undefined) {
      setWarning(t('pleaseSelectAnswer'));
      setTimeout(() => setWarning(""), 2000);
      return;
    }

    if (currentQ < questions.length - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      const codeCounts = [0, 0, 0, 0, 0, 0, 0];
      Object.values(answers).forEach(code => {
        if (code >= 0 && code <= 6) {
          codeCounts[code] += 1;
        }
      });
      navigation.navigate("GameResult", { codeCounts });
    }
  };

  const handlePrev = () => {
    if (currentQ > 0) setCurrentQ(currentQ - 1);
  };

  if (questions.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <Text>{t("loadingGame")}</Text>
      </View>
    );
  }

  const question = questions[currentQ];
  const selectedCode = answers[question.id];
  const isLastQuestion = currentQ === questions.length - 1;

  return (
    <View style={styles.mainContainer}>
      <ScrollView 
        style={{ flex: 1, width: '100%' }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.counterText}>
          {`${currentQ + 1} / ${questions.length}`}
        </Text>

        <Text style={styles.questionText}>{question.text}</Text>

        <View style={styles.optionsContainer}>
          {question.options.map((opt, index) => {
            const isSelected = selectedCode === opt.code;
            
            return (
              <StyledButton
                key={`${question.id}-opt-${index}`}
                onPress={() => handleSelectAnswer(question.id, opt.code)}
                // --- CAMBIO CLAVE: Usamos variants ---
                variant={isSelected ? "primary" : "secondary"}
                style={[
                    styles.optionButton,
                    isSelected && styles.selectedBorder // Borde extra para resaltar
                ]}
              >
                {/* El color del texto lo controlamos aquí para asegurar contraste */}
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

        {warning ? <Text style={styles.warningText}>{warning}</Text> : null}

        <View style={styles.actionsContainer}>
          {/* Botón Anterior: Variante 'ghost' para menos peso visual */}
          <StyledButton
            title={t("previous")}
            onPress={handlePrev}
            disabled={currentQ === 0}
            variant="ghost"
            style={{ width: '30%' }}
          />
          
          {/* Botón Siguiente/Finalizar: Variante 'primary' o 'success' */}
          <StyledButton
            title={isLastQuestion ? t("finishGame") : t("next")}
            onPress={handleNext}
            variant={isLastQuestion ? "success" : "primary"}
            style={{ width: '40%' }}
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.background,
  },
  mainContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1, 
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    width: "100%",
    maxWidth: 600,
    alignSelf: "center",
    paddingBottom: 40,
  },
  counterText: {
    alignSelf: 'flex-end', 
    marginBottom: 10,
    color: COLORS.textSecondary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  questionText: {
    fontSize: 22,
    fontWeight: "700", // Negrita consistente con ExamScreen
    textAlign: "center",
    marginVertical: 32,
    color: COLORS.text,
    lineHeight: 30,
  },
  optionsContainer: {
    width: "100%",
    gap: 12, // Espacio uniforme entre botones
    marginBottom: 20,
  },
  optionButton: {
    width: "100%",
    paddingVertical: 16, // Altura cómoda
    // Quitamos bordes/colores manuales, lo hace StyledButton
  },
  selectedBorder: {
    borderColor: COLORS.primary,
    borderWidth: 2,
  },
  warningText: {
    color: COLORS.error,
    marginTop: 10,
    marginBottom: 10,
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '500'
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
});