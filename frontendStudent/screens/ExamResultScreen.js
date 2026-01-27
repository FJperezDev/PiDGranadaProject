import { useEffect, useState, useRef } from "react";
import { View, Text, ScrollView, StyleSheet, Platform, ActivityIndicator } from "react-native";
import { useLanguage } from "../context/LanguageContext";
import { StyledButton } from "../components/StyledButton";
import { COLORS } from "../constants/colors"; 
import { useIsFocused } from "@react-navigation/native";
import { useVoiceControl } from "../context/VoiceContext";
import { mockApi } from "../services/api";

export const ExamResultScreen = ({ route, navigation }) => {
  const { t, language } = useLanguage();
  const isFocused = useIsFocused();
  const { transcript, setTranscript } = useVoiceControl();
  
  const { 
    code, 
    score, 
    total, 
    // recommendations, // No se usa en esta pantalla según tu lógica actual
    questions = [], 
    userAnswers = {}
  } = route.params;

  const [examQuestions, setExamQuestions] = useState(questions);
  const [isTranslating, setIsTranslating] = useState(false);
  const isInitialMount = useRef(true);

  const normalizeText = (text) => {
    return text ? text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim() : "";
  };

  // Función unificada para terminar la revisión
  const handleEndRevision = () => {
    navigation.navigate('Subject', { code: code });
  };

  // --- Voice Control ---
  useEffect(() => {
    if (!transcript || !isFocused) return;

    const spoken = normalizeText(transcript);
    
    // Comandos para terminar/continuar
    if (
        spoken.includes('siguiente') || 
        spoken.includes('terminar') || 
        spoken.includes('finalizar') || 
        spoken.includes('continuar') || 
        spoken.includes('next') || 
        spoken.includes('finish')
    ) {
        handleEndRevision();
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

  }, [transcript, isFocused, navigation, code]);

  // --- Traducción de preguntas ---
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (!examQuestions || examQuestions.length === 0) return;

    const translateQuestions = async () => {
      setIsTranslating(true);
      try {
        const translationPromises = examQuestions.map(q => mockApi.getQuestion(q.id));
        const translatedQuestions = await Promise.all(translationPromises);
        setExamQuestions(translatedQuestions);
      } catch (error) {
        console.error("Error traduciendo resultados:", error);
      } finally {
        setIsTranslating(false);
      }
    };

    translateQuestions();
  }, [language]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('results')}</Text>
      
      {/* Puntuación */}
      <View style={styles.scoreContainer}>
        <Text style={styles.scoreText}>
            {`${t('score')}: ${score} / ${total}`}
        </Text>
      </View>

      {isTranslating ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={{ marginTop: 10, color: COLORS.textSecondary }}>{t('loading')}</Text>
        </View>
      ) : (
        <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          {examQuestions.map((q, index) => {
            const userAnswerId = userAnswers[q.id];
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
                    // Ajuste visual para el texto según el estado
                    let textStyle = { 
                        fontSize: 16, 
                        color: COLORS.text 
                    };

                    if (isSelected && isCorrectOption) {
                      optionStyle = styles.optionCorrect; 
                      textStyle.fontWeight = 'bold';
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
            title={t('endRevision')} 
            // 👇 AQUÍ ESTABA EL ERROR. Ahora usa la función arrow o la referencia.
            onPress={handleEndRevision} 
            variant="primary" // Usamos el sistema de diseño
            size="large"
            style={styles.nextButton} 
            disabled={isTranslating}
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
    marginBottom: 20,
  },
  scoreContainer: {
    marginBottom: 24,
    paddingVertical: 16,
    paddingHorizontal: 24,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    elevation: 3,
    shadowColor: COLORS.shadow,
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  scoreText: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.primary, 
  },
  scrollContainer: {
    width: '100%',
    flex: 1,
  },
  questionCard: {
    backgroundColor: COLORS.surface,
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    ...(Platform.OS === 'web'
      ? { boxShadow: '0px 2px 4px rgba(0,0,0,0.05)' }
      : { elevation: 2 }),
  },
  questionStatement: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
    color: COLORS.text,
    lineHeight: 26,
  },
  optionsList: {
    marginBottom: 12,
    gap: 10,
  },
  optionBase: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.border, // Borde por defecto más suave
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
    backgroundColor: COLORS.surface, 
    borderColor: COLORS.successBorder,
    borderStyle: 'dashed', 
    borderWidth: 2,
  },
  explanationContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: COLORS.warningLight, 
    borderLeftWidth: 4,
    borderLeftColor: COLORS.warning, 
    borderRadius: 8,
  },
  explanationLabel: {
    fontWeight: 'bold',
    color: COLORS.warningText,
    marginBottom: 6,
    fontSize: 14,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  explanationText: {
    fontSize: 15,
    color: COLORS.warningDark,
    lineHeight: 24,
  },
  footer: {
    width: '100%',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  nextButton: {
    width: '100%', // El StyledButton con size="large" ya maneja el padding
  },
});