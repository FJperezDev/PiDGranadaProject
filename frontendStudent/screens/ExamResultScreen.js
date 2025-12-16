import { useEffect, useState, useRef } from "react"; // Añadido useRef
import { View, Text, ScrollView, StyleSheet, Platform, ActivityIndicator } from "react-native"; // Añadido ActivityIndicator
import { useLanguage } from "../context/LanguageContext";
import { StyledButton } from "../components/StyledButton";
import { COLORS } from "../constants/colors"; 
import { useIsFocused } from "@react-navigation/native";
import { useVoiceControl } from "../context/VoiceContext";
import { mockApi } from "../services/api"; // Importamos mockApi para traducir

export const ExamResultScreen = ({ route, navigation }) => {
  const { t, language } = useLanguage(); // Traemos 'language'
  const isFocused = useIsFocused();
  const { transcript, setTranscript } = useVoiceControl();
  
  const { 
    code, 
    score, 
    total, 
    recommendations, 
    questions = [], // Fallback a array vacío
    userAnswers = {}
  } = route.params;

  // Estado local para las preguntas (para poder traducirlas)
  const [examQuestions, setExamQuestions] = useState(questions);
  const [isTranslating, setIsTranslating] = useState(false);
  const isInitialMount = useRef(true);

  const handleContinue = () => {
    navigation.navigate("ExamRecommendations", {
      code,
      recommendations,
      score,
      total,
    });
  };

  const normalizeText = (text) => {
    return text ? text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim() : "";
  };

  // --- Efecto para Control de Voz (Sin cambios) ---
  useEffect(() => {
    if (!transcript || !isFocused) return;

    const spoken = normalizeText(transcript);
    console.log("Comando oído en ExamResult:", spoken);

    if (
        spoken.includes('siguiente') || 
        spoken.includes('recomendaciones') || 
        spoken.includes('continuar') || 
        spoken.includes('next') || 
        spoken.includes('recommendations')
    ) {
        handleContinue();
        setTranscript('');
        return;
    }

    if (spoken.includes('volver') || spoken.includes('atras') || spoken.includes('back')) {
        if (navigation.canGoBack()) navigation.goBack();
        setTranscript('');
        return;
    }

    if (spoken.includes('inicio') || spoken.includes('home') || spoken.includes('casa')) {
        navigation.navigate('Home');
        setTranscript('');
        return;
    }

  }, [transcript, isFocused, navigation]);

  // --- NUEVO: Efecto para Traducir Preguntas al cambiar idioma ---
  useEffect(() => {
    // Evitamos traducir en la primera carga si ya vienen en el idioma correcto,
    // o puedes quitar esta guarda si prefieres forzar la traducción siempre.
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (!examQuestions || examQuestions.length === 0) return;

    const translateQuestions = async () => {
      setIsTranslating(true);
      try {
        // Mapeamos todas las preguntas actuales para pedir su traducción
        const translationPromises = examQuestions.map(q => mockApi.getQuestion(q.id));
        const translatedQuestions = await Promise.all(translationPromises);
        
        // Actualizamos el estado con las nuevas preguntas traducidas
        setExamQuestions(translatedQuestions);
      } catch (error) {
        console.error("Error traduciendo resultados:", error);
      } finally {
        setIsTranslating(false);
      }
    };

    translateQuestions();
  }, [language]); // Se ejecuta cada vez que 'language' cambia

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('results')}</Text>
      
      {/* Puntuación */}
      <View style={styles.scoreContainer}>
        <Text style={styles.scoreText}>
            {`${t('score')}: ${score} / ${total}`}
        </Text>
      </View>

      {/* Si se está traduciendo, mostramos un loader, si no, la lista */}
      {isTranslating ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={{ marginTop: 10, color: COLORS.textSecondary }}>{t('loading')}</Text>
        </View>
      ) : (
        <ScrollView style={styles.scrollContainer}>
          {examQuestions.map((q, index) => {
            const userAnswerId = userAnswers[q.id];
            
            // Buscamos la opción seleccionada por el usuario en la pregunta (traducida o no)
            // NOTA: Asumimos que los IDs de las respuestas NO cambian al traducir.
            const selectedOption = q.answers.find(opt => opt.id === userAnswerId);
            const isQuestionAnsweredCorrectly = selectedOption?.is_correct === true;
            
            return (
              <View key={q.id} style={styles.questionCard}>
                <Text style={styles.questionStatement}>
                  {index + 1}. {q.statement}
                </Text>

                <View style={styles.optionsList}>
                  {q.answers.map((opt) => {
                    const isSelected = userAnswerId === opt.id;
                    const isCorrectOption = opt.is_correct === true;

                    let optionStyle = styles.optionDefault;
                    let textStyle = styles.optionTextDefault;

                    if (isSelected && isCorrectOption) {
                      optionStyle = styles.optionCorrect; 
                    } else if (isSelected && !isCorrectOption) {
                      optionStyle = styles.optionWrong; 
                    } else if (!isSelected && isCorrectOption) {
                      optionStyle = styles.optionMissedCorrect; 
                    }

                    return (
                      <View key={opt.id} style={[styles.optionBase, optionStyle]}>
                        <Text style={textStyle}>
                          {opt.text} 
                          {isCorrectOption ? " ✔" : ""} 
                          {isSelected && !isCorrectOption ? " ✘" : ""}
                        </Text>
                      </View>
                    );
                  })}
                </View>

                {!isQuestionAnsweredCorrectly && q.explanation && (
                  <View style={styles.explanationContainer}>
                    <Text style={styles.explanationLabel}>{t('explanation') || "Explanation"}:</Text>
                    <Text style={styles.explanationText}>{q.explanation}</Text>
                  </View>
                )}
              </View>
            );
          })}
        </ScrollView>
      )}

      <View style={styles.footer}>
        <StyledButton 
            title={t('next')} 
            onPress={handleContinue} 
            style={styles.nextButton} 
            disabled={isTranslating} // Deshabilitar si carga
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    width: '100%',
    maxWidth: 800,
    alignSelf: 'center',
    padding: 20,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: 20,
    marginBottom: 10,
  },
  scoreContainer: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    elevation: 2,
    shadowColor: COLORS.shadow,
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  scoreText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary, 
  },
  scrollContainer: {
    width: '100%',
    flex: 1,
  },
  questionCard: {
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    ...(Platform.OS === 'web'
      ? { boxShadow: '0px 1px 3px rgba(0,0,0,0.05)' }
      : { elevation: 2 }),
  },
  questionStatement: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: COLORS.textSecondary,
  },
  optionsList: {
    marginBottom: 10,
  },
  optionBase: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  optionDefault: {
    backgroundColor: COLORS.surface,
  },
  optionCorrect: { 
    backgroundColor: COLORS.successLight, 
    borderColor: COLORS.successBorder, 
  },
  optionWrong: { 
    backgroundColor: COLORS.errorLight, 
    borderColor: COLORS.error, 
  },
  optionMissedCorrect: { 
    backgroundColor: COLORS.successLight, 
    borderColor: COLORS.successBorder,
    borderStyle: 'dashed', 
  },
  optionTextDefault: {
    fontSize: 16,
    color: COLORS.text,
  },
  explanationContainer: {
    marginTop: 10,
    padding: 12,
    backgroundColor: COLORS.warningLight, 
    borderLeftWidth: 4,
    borderLeftColor: COLORS.warning, 
    borderRadius: 4,
  },
  explanationLabel: {
    fontWeight: 'bold',
    color: COLORS.warningText,
    marginBottom: 4,
  },
  explanationText: {
    fontSize: 15,
    color: COLORS.warningDark,
    lineHeight: 22,
  },
  footer: {
    width: '100%',
    paddingTop: 10,
  },
  nextButton: {
    backgroundColor: COLORS.primary, 
    padding: 16,
    borderRadius: 10,
  },
});