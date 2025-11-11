import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet } from "react-native";
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
    // Cargar las preguntas según el idioma actual
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
      // ✅ Cuando termina el test, calculamos la frecuencia de cada código
      const codeCounts = [0, 0, 0, 0, 0, 0, 0]; // índices 0–5

      Object.values(answers).forEach(code => {
        if (code >= 0 && code <= 6) {
          codeCounts[code] += 1;
        }
      });

      // Navegar al resultado con el array de frecuencias y las respuestas completas
      navigation.navigate("GameResult", {
        codeCounts
      });
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
    <View style={styles.container}>
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
              onPress={() => handleSelectAnswer(question.id, opt.code)}
            >
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
        />
        <StyledButton
          title={currentQ === questions.length - 1 ? t("finishGame") : t("next")}
          onPress={handleNext}
          style={[
            styles.nextButton,
            currentQ === questions.length - 1 ? styles.finishButton : styles.nextButtonDefault
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  container: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    width: "100%",
    maxWidth: 600,
    alignSelf: "center",
  },
  counterText: {
    position: "absolute",
    top: 100,
    right: 20,
    color: "#64748b",
  },
  questionText: {
    fontSize: 22,
    fontWeight: "500",
    textAlign: "center",
    marginVertical: 40,
  },
  optionsContainer: {
    width: "100%",
  },
  optionButton: {
    width: "100%",
    padding: 16,
    marginBottom: 16,
    borderRadius: 8,
    borderWidth: 2,
    fontSize: 18,
    textAlign: "center",
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
    marginBottom: -10,
    fontSize: 16,
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 32,
  },
  nextButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  nextButtonDefault: {
    backgroundColor: "#a5f3fc",
  },
  finishButton: {
    backgroundColor: "#22c55e",
  },
});
