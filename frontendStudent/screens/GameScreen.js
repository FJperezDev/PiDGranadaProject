import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet } from "react-native";
import { useNavigation } from '@react-navigation/native';
import { useLanguage } from "../context/LanguageContext";
import { StyledButton } from "../components/StyledButton";
import { mockApi as oldMockApi } from '../services/oldApi';

export const GameScreen = () => {
  const navigation = useNavigation();
  const { t } = useLanguage();

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [currentQ, setCurrentQ] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [warning, setWarning] = useState(""); // ⚠️ aviso de respuesta no seleccionada

  useEffect(() => {
    oldMockApi.getGameQuestions().then(data => {
      setQuestions(data);
      setIsLoading(false);
    });
  }, []);

  const handleSelectAnswer = (questionId, answer) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
    setWarning(""); // limpiar aviso al responder
  };

  const handleNext = () => {
    const question = questions[currentQ];
    if (!answers[question.id]) {
      // mostrar aviso si no hay respuesta
      setWarning(t('pleaseSelectAnswer') || "Por favor, selecciona una respuesta antes de continuar.");
      setTimeout(() => setWarning(""), 2000);
      return;
    }

    if (currentQ < questions.length - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      navigation.navigate('GameResult');
    }
  };

  const handlePrev = () => {
    if (currentQ > 0) {
      setCurrentQ(currentQ - 1);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>{t('loadingGame')}</Text>
      </View>
    );
  }

  const question = questions[currentQ];
  const selectedAnswer = answers[question.id];

  return (
    <View style={styles.container}>
      <Text style={styles.counterText}>
        {`${currentQ + 1} / ${questions.length}`}
      </Text>

      <Text style={styles.questionText}>{question.text}</Text>

      <View style={styles.optionsContainer}>
        {question.options.map(opt => {
          const isSelected = selectedAnswer === opt;
          return (
            <StyledButton
              key={opt}
              style={[
                styles.optionButton,
                isSelected ? styles.optionSelected : styles.optionUnselected
              ]}
              onPress={() => handleSelectAnswer(question.id, opt)}
            >
              <Text style={{ textAlign: "center", fontSize: 16 }}>{opt}</Text>
            </StyledButton>
          );
        })}
      </View>

      {warning ? <Text style={styles.warningText}>{warning}</Text> : null}

      <View style={styles.actionsContainer}>
        <StyledButton
          title={t('previous')}
          onPress={handlePrev}
          disabled={currentQ === 0}
        />
        <StyledButton
          title={currentQ === questions.length - 1 ? t('finishGame') : t('next')}
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
  },
  counterText: {
    position: 'absolute',
    top: 100,
    right: 20,
    color: '#64748b',
  },
  questionText: {
    fontSize: 22,
    fontWeight: '500',
    textAlign: 'center',
    marginVertical: 40,
  },
  optionsContainer: {
    width: '100%',
  },
  optionButton: {
    width: '100%',
    padding: 16,
    marginBottom: 16,
    borderRadius: 8,
    borderWidth: 2,
    fontSize: 18,
    textAlign: 'center',
  },
  optionSelected: {
    backgroundColor: '#cffafe',
    borderColor: '#67e8f9',
  },
  optionUnselected: {
    backgroundColor: '#ffffff',
    borderColor: '#cbd5e1',
  },
  warningText: {
    color: '#dc2626', // rojo
    marginTop: 10,
    marginBottom: -10,
    fontSize: 16,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 32,
  },
  nextButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  nextButtonDefault: {
    backgroundColor: '#a5f3fc',
  },
  finishButton: {
    backgroundColor: '#22c55e',
  },
});
