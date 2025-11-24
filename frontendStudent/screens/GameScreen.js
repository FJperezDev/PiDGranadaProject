import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, ScrollView } from "react-native"; // 1. Importar ScrollView
import { useNavigation } from '@react-navigation/native';
import { useLanguage } from "../context/LanguageContext";
import { StyledButton } from "../components/StyledButton";
import { GAME_QUESTIONS } from "../constants/game";

export const GameScreen = () => {
  const navigation = useNavigation();
  const { language, t } = useLanguage();

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [currentQ, setCurrentQ] = useState(0);
  const [warning, setWarning] = useState("");

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
      setWarning(t('pleaseSelectAnswer') || "Por favor, selecciona una respuesta antes de continuar.");
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

  return (
    // 2. Usamos ScrollView en lugar de View
    <ScrollView 
      style={styles.mainContainer}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Contador movido al flujo normal para evitar solapamientos */}
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
              style={[
                styles.optionButton,
                isSelected ? styles.optionSelected : styles.optionUnselected
              ]}
              // Ojo: Si tus opciones tienen texto negro, asegúrate de pasarlo
              textStyle={{ color: '#0f172a' }} 
              onPress={() => handleSelectAnswer(question.id, opt.code)}
            >
              {/* Pasamos el texto como hijo para que StyledButton lo renderice, 
                  o usamos title="" y textStyle. Aquí lo dejo como hijo que es flexible */}
              <Text style={{ textAlign: "center", fontSize: 16 }}>
                {opt.text}
              </Text>
            </StyledButton>
          );
        })}
      </View>

      {warning ? <Text style={styles.warningText}>{warning}</Text> : null}

      <View style={styles.actionsContainer}>
        <StyledButton
          title={t("previous")}
          onPress={handlePrev}
          disabled={currentQ === 0}
          // Aseguramos contraste si hace falta
          style={{ backgroundColor: '#e2e8f0' }} 
        />
        <StyledButton
          title={currentQ === questions.length - 1 ? t("finishGame") : t("next")}
          onPress={handleNext}
          style={[
            styles.nextButton,
            currentQ === questions.length - 1 ? styles.finishButton : styles.nextButtonDefault
          ]}
          // IMPORTANTE: El arreglo del color de texto del mensaje anterior
          textStyle={{ 
            color: currentQ === questions.length - 1 ? 'white' : '#0f172a' 
          }}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  // Contenedor externo del ScrollView
  mainContainer: {
    flex: 1,
    backgroundColor: '#fff', // O COLORS.background
  },
  // Contenedor interno (lo que antes era container)
  scrollContent: {
    flexGrow: 1, // Esto permite que si hay poco contenido, se centre, pero si hay mucho, crezca
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    width: "100%",
    maxWidth: 600,
    alignSelf: "center",
    paddingBottom: 40, // Espacio extra abajo para que los botones no toquen el borde
  },
  counterText: {
    // Ya no es absolute, se alinea a la derecha
    alignSelf: 'flex-end', 
    marginBottom: 10,
    color: "#64748b",
    fontSize: 16,
    fontWeight: 'bold',
  },
  questionText: {
    fontSize: 22,
    fontWeight: "500",
    textAlign: "center",
    marginVertical: 20, // Reducido un poco para aprovechar espacio
  },
  optionsContainer: {
    width: "100%",
    marginBottom: 20,
  },
  optionButton: {
    width: "100%",
    padding: 16,
    marginBottom: 16,
    borderRadius: 8,
    borderWidth: 2,
    // Eliminamos fontSize y textAlign de aquí porque se aplican al contenedor, no al texto directo
  },
  optionSelected: {
    backgroundColor: "#cffafe",
    borderColor: "#67e8f9",
  },
  optionUnselected: {
    backgroundColor: "#ffffff",
    borderColor: "#cbd5e1",
  },
  warningText: {
    color: "#dc2626",
    marginTop: 10,
    marginBottom: 10,
    fontSize: 16,
    textAlign: 'center'
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 10,
  },
  nextButton: {
    paddingHorizontal: 24, // Un poco más ancho
    paddingVertical: 12,
    borderRadius: 8,
  },
  nextButtonDefault: {
    backgroundColor: "#a5f3fc",
  },
  finishButton: {
    backgroundColor: "#22c55e",
  },
});