import { useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';
import Voice from '@react-native-voice/voice';

export const useVoiceAnswer = (language = 'es-ES') => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [matchResult, setMatchResult] = useState(null);

  // Normalizar texto para comparaciones (quitar acentos, minúsculas)
  const normalizeText = (text) => {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();
  };

  // Función para encontrar la mejor coincidencia entre las opciones
  const findBestMatch = (spokenText, options) => {
    const normalizedSpoken = normalizeText(spokenText);
    
    // 1. Coincidencia directa con el texto de la opción
    const directMatch = options.find(opt => 
      normalizedSpoken.includes(normalizeText(opt.text)) || 
      normalizeText(opt.text).includes(normalizedSpoken)
    );

    if (directMatch) return directMatch.id;

    // 2. Coincidencia por palabras clave (ej: "la primera", "opción A")
    // Aquí podrías agregar lógica más compleja si lo deseas.
    
    return null;
  };

  const startListening = useCallback(async () => {
    setIsListening(true);
    setTranscript('');
    setMatchResult(null);

    try {
      if (Platform.OS === 'web') {
        // Lógica WEB
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
          alert("Tu navegador no soporta reconocimiento de voz.");
          setIsListening(false);
          return;
        }
        
        const recognition = new SpeechRecognition();
        recognition.lang = language;
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onresult = (event) => {
          const text = event.results[0][0].transcript;
          setTranscript(text);
          setIsListening(false);
        };

        recognition.onerror = (event) => {
          console.error("Web Speech Error:", event.error);
          setIsListening(false);
        };

        recognition.onend = () => setIsListening(false);
        recognition.start();
        
      } else {
        // Lógica NATIVA (Android/iOS)
        await Voice.start(language);
      }
    } catch (e) {
      console.error(e);
      setIsListening(false);
    }
  }, [language]);

  const stopListening = useCallback(async () => {
    try {
      if (Platform.OS !== 'web') {
        await Voice.stop();
      }
      setIsListening(false);
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Configurar listeners nativos
  useEffect(() => {
    if (Platform.OS !== 'web') {
      Voice.onSpeechResults = (e) => {
        if (e.value && e.value.length > 0) {
          setTranscript(e.value[0]);
          stopListening(); // Detener al recibir resultado
        }
      };
      
      Voice.onSpeechError = (e) => {
        console.error("Native Voice Error:", e);
        setIsListening(false);
      };

      return () => {
        Voice.destroy().then(Voice.removeAllListeners);
      };
    }
  }, [stopListening]);

  return {
    isListening,
    transcript,
    startListening,
    stopListening,
    findBestMatch
  };
};