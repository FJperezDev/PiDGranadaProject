import { useEffect } from "react";
import { View, Text, ScrollView, StyleSheet, Platform } from "react-native";
import { useLanguage } from "../context/LanguageContext";
import { StyledButton } from "../components/StyledButton";
import { COLORS } from "../constants/colors"; 
import { useIsFocused } from "@react-navigation/native";
import { useVoiceControl } from "../context/VoiceContext";

export const ExamResultScreen = ({ route, navigation }) => {
  const { t } = useLanguage();
  const isFocused = useIsFocused();
  const { transcript, setTranscript } = useVoiceControl();

  const { 
    code, 
    score, 
    total, 
    recommendations, 
    questions = [], 
    userAnswers = {}
  } = route.params;
  
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

  useEffect(() => {
    // Si no hay texto o la pantalla no está activa, no hacemos nada
    if (!transcript || !isFocused) return;

    const spoken = normalizeText(transcript);
    console.log("Comando oído en ExamResult:", spoken);

    // --- Comandos de Acción Principal (Ir a Recomendaciones) ---
    // Palabras clave: siguiente, recomendaciones, continuar, next, recommendations
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

    // --- Comandos de Navegación General ---
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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('results')}</Text>
      
      {/* Puntuación */}
      <View style={styles.scoreContainer}>
        <Text style={styles.scoreText}>
            {`${t('score')}: ${score} / ${total}`}
        </Text>
      </View>

      <ScrollView style={styles.scrollContainer}>
        {questions.map((q, index) => {
          const userAnswerId = userAnswers[q.id];
          
          // Buscamos la opción que eligió el usuario para saber si acertó la pregunta entera
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
                  // CAMBIO AQUÍ: Usamos opt.is_correct directamente
                  const isCorrectOption = opt.is_correct === true;

                  let optionStyle = styles.optionDefault;
                  let textStyle = styles.optionTextDefault;

                  // Lógica de estilos:
                  if (isSelected && isCorrectOption) {
                    // El usuario marcó esta y ES correcta -> VERDE
                    optionStyle = styles.optionCorrect; 
                  } else if (isSelected && !isCorrectOption) {
                    // El usuario marcó esta y NO es correcta -> ROJO
                    optionStyle = styles.optionWrong; 
                  } else if (!isSelected && isCorrectOption) {
                    // El usuario NO marcó esta, pero ERA la correcta -> VERDE CLARO (corrección)
                    optionStyle = styles.optionMissedCorrect; 
                  }

                  return (
                    <View key={opt.id} style={[styles.optionBase, optionStyle]}>
                      <Text style={textStyle}>
                        {opt.text} 
                        {/* Iconos indicadores */}
                        {isCorrectOption ? " ✔" : ""} 
                        {isSelected && !isCorrectOption ? " ✘" : ""}
                      </Text>
                    </View>
                  );
                })}
              </View>

              {/* Mostrar Explanation si la pregunta NO fue respondida correctamente */}
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

      <View style={styles.footer}>
        <StyledButton 
            title={t('next') || "See Recommendations"} 
            onPress={handleContinue} 
            style={styles.nextButton} 
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
    backgroundColor: '#f8fafc',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0f172a',
    marginTop: 20,
    marginBottom: 10,
  },
  scoreContainer: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 2,
  },
  scoreText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0284c7', 
  },
  scrollContainer: {
    width: '100%',
    flex: 1,
  },
  questionCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    ...(Platform.OS === 'web'
      ? { boxShadow: '0px 1px 3px rgba(0,0,0,0.05)' }
      : { elevation: 2 }),
  },
  questionStatement: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#334155',
  },
  optionsList: {
    marginBottom: 10,
  },
  optionBase: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  optionDefault: {
    backgroundColor: '#fff',
  },
  optionCorrect: { // Usuario acertó
    backgroundColor: '#dcfce7', 
    borderColor: '#22c55e', 
  },
  optionWrong: { // Usuario falló
    backgroundColor: '#fee2e2', 
    borderColor: '#ef4444', 
  },
  optionMissedCorrect: { // Era la correcta pero no la marcó
    backgroundColor: '#f0fdf4', 
    borderColor: '#22c55e',
    borderStyle: 'dashed', 
  },
  optionTextDefault: {
    fontSize: 16,
    color: '#333',
  },
  explanationContainer: {
    marginTop: 10,
    padding: 12,
    backgroundColor: '#fff7ed', 
    borderLeftWidth: 4,
    borderLeftColor: '#f97316', 
    borderRadius: 4,
  },
  explanationLabel: {
    fontWeight: 'bold',
    color: '#c2410c',
    marginBottom: 4,
  },
  explanationText: {
    fontSize: 15,
    color: '#431407',
    lineHeight: 22,
  },
  footer: {
    width: '100%',
    paddingTop: 10,
  },
  nextButton: {
    backgroundColor: '#0ea5e9', 
    padding: 16,
    borderRadius: 10,
  },
});