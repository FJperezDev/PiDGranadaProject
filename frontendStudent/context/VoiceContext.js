import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';
import Voice from '@react-native-voice/voice';
import { useLanguage } from './LanguageContext';

const VoiceContext = createContext();

export const VoiceProvider = ({ children }) => {
  const { language } = useLanguage(); // 'es' o 'en'
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  
  // Mapeo de idioma simple para la API de voz
  const locale = language === 'en' ? 'en-US' : 'es-ES';

  const startListening = useCallback(async () => {
    setTranscript('');
    setIsListening(true);
    try {
      if (Platform.OS === 'web') {
        // Lógica Web
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) return;
        
        const recognition = new SpeechRecognition();
        recognition.lang = locale;
        recognition.continuous = true; // IMPORTANTE: Escuchar continuamente
        recognition.interimResults = false;

        recognition.onresult = (event) => {
          const lastIndex = event.results.length - 1;
          const text = event.results[lastIndex][0].transcript;
          setTranscript(text); // Actualizamos el texto global
          
          // Limpiamos el transcript después de un momento para evitar comandos duplicados
          setTimeout(() => setTranscript(''), 1500);
        };

        recognition.start();
        window.recognitionInstance = recognition; // Guardar referencia para detenerlo
      } else {
        // Lógica Nativa
        await Voice.start(locale);
      }
    } catch (e) {
      console.error(e);
      setIsListening(false);
    }
  }, [locale]);

  const stopListening = useCallback(async () => {
    try {
      if (Platform.OS === 'web') {
        if (window.recognitionInstance) window.recognitionInstance.stop();
      } else {
        await Voice.stop();
      }
      setIsListening(false);
    } catch (e) {
      console.error(e);
    }
  }, []);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  // Configuración de eventos nativos
  useEffect(() => {
    if (Platform.OS !== 'web') {
      Voice.onSpeechResults = (e) => {
        if (e.value && e.value.length > 0) {
          setTranscript(e.value[0]);
          // Reiniciar ciclo en nativo si fuera necesario, 
          // aunque Voice.start suele parar al recibir resultado. 
          // Para "Continuous" en nativo es más complejo, 
          // por ahora asumimos comando por comando o reinicio manual.
          
          // Truco para mantenerlo "activo" si quieres conversación fluida:
          // setTimeout(() => Voice.start(locale), 1000); 
          // PERO para tu caso de botón toggle, es mejor que pare y el usuario hable de nuevo
          // o usar lógica de reinicio automático si isListening es true.
        }
      };
      
      return () => {
        Voice.destroy().then(Voice.removeAllListeners);
      };
    }
  }, []);

  // Reinicio automático para Móvil si queremos "Always listening" mientras el botón esté activo
  // Nota: Esto consume batería. Úsalo con precaución.
  useEffect(() => {
     if (Platform.OS !== 'web' && isListening && transcript) {
         const timer = setTimeout(() => {
             setTranscript('');
             Voice.start(locale); 
         }, 1500);
         return () => clearTimeout(timer);
     }
  }, [transcript, isListening, locale]);


  return (
    <VoiceContext.Provider value={{ isListening, transcript, toggleListening, setTranscript }}>
      {children}
    </VoiceContext.Provider>
  );
};

export const useVoiceControl = () => useContext(VoiceContext);