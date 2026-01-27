import React, { createContext, useState, useContext, useEffect, useCallback, useRef } from 'react';
import { Platform } from 'react-native';
import Voice from '@react-native-voice/voice';
import { useLanguage } from './LanguageContext';

console.log("¿Módulo Voice cargado?:", !!Voice);
console.log("¿Métodos disponibles?:", Object.keys(Voice || {}));

const VoiceContext = createContext();

export const VoiceProvider = ({ children }) => {
  const { language } = useLanguage(); 
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  
  // Ref para mantener el estado real sin depender de closures antiguos en los eventos
  const isListeningRef = useRef(false); 
  const locale = language === 'en' ? 'en-US' : 'es-ES';

  // --- LÓGICA WEB ---
  const startWebListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    // Si ya existe una instancia, la detenemos antes de crear otra para evitar duplicados
    if (window.recognitionInstance) {
        window.recognitionInstance.onend = null; // Quitamos listener para evitar bucle fantasma
        window.recognitionInstance.stop();
    }

    const recognition = new SpeechRecognition();
    recognition.lang = locale;
    recognition.continuous = true; 
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const lastIndex = event.results.length - 1;
      const text = event.results[lastIndex][0].transcript;
      setTranscript(text);
      
      // Limpiar transcript para permitir el siguiente comando
      setTimeout(() => setTranscript(''), 1500);
    };

    // CLAVE PARA WEB: Cuando el navegador corta la escucha, reiniciamos si sigue activo
    recognition.onend = () => {
      if (isListeningRef.current) {
        recognition.start();
      }
    };

    recognition.onerror = (event) => {
        console.warn('Web Speech Error:', event.error);
        // En caso de error 'no-speech', intentamos reiniciar
        if (event.error === 'no-speech' && isListeningRef.current) {
            // Pequeño delay para no saturar
            setTimeout(() => {
                try { recognition.start(); } catch(e){}
            }, 500);
        }
    };

    try {
        recognition.start();
        window.recognitionInstance = recognition;
    } catch (e) {
        console.error(e);
    }
  };

  // --- LÓGICA NATIVA ---
  const startNativeListening = async () => {
    try {
      // Si Voice es null, esto petará aquí con un error más descriptivo
      if (!Voice) {
         alert("Error: El objeto Voice es undefined/null.");
         return;
      }
      
      await Voice.start(locale);
    } catch (e) {
      console.error(e);
      alert("Error nativo: " + e.message);
    }
  };

  // --- MÉTODOS PÚBLICOS ---

  const startListening = useCallback(() => {
    setTranscript('');
    setIsListening(true);
    isListeningRef.current = true; // Marcamos la intención de escuchar

    if (Platform.OS === 'web') {
      startWebListening();
    } else {
      startNativeListening();
    }
  }, [locale]);

  const stopListening = useCallback(async () => {
    setIsListening(false);
    isListeningRef.current = false; // Marcamos la intención de parar

    try {
      if (Platform.OS === 'web') {
        if (window.recognitionInstance) {
            // Importante: anular onend para que no se reinicie al llamar a stop()
            window.recognitionInstance.onend = null; 
            window.recognitionInstance.stop();
        }
      } else {
        await Voice.stop();
        // Native Voice también podría necesitar destroy para limpieza total
        await Voice.destroy(); 
        Voice.removeAllListeners();
      }
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

  // --- CONFIGURACIÓN EVENTOS NATIVOS ---
  useEffect(() => {
    if (Platform.OS !== 'web') {
      
      const onSpeechResults = (e) => {
        if (e.value && e.value.length > 0) {
          setTranscript(e.value[0]);
          setTimeout(() => setTranscript(''), 1500);
        }
      };

      // CLAVE PARA NATIVO: Cuando termina, reiniciamos
      const onSpeechEnd = () => {
         if (isListeningRef.current) {
             // Pequeño delay para dar respiro al hilo UI
             setTimeout(() => {
                 Voice.start(locale).catch(e => console.log('Restart error', e));
             }, 500);
         }
      };

      // Manejo de errores para evitar que muera silenciosamente
      const onSpeechError = (e) => {
          // Si es un error recuperable, reiniciamos
          if (isListeningRef.current) {
             setTimeout(() => {
                 Voice.start(locale).catch(e => console.log('Restart error', e));
             }, 1000);
          }
      }

      Voice.onSpeechResults = onSpeechResults;
      Voice.onSpeechEnd = onSpeechEnd;
      Voice.onSpeechError = onSpeechError;

      return () => {
        Voice.destroy().then(Voice.removeAllListeners);
      };
    }
  }, [locale]); // Dependencia de locale para reiniciar si cambia el idioma

  return (
    <VoiceContext.Provider value={{ isListening, transcript, toggleListening, setTranscript }}>
      {children}
    </VoiceContext.Provider>
  );
};

export const useVoiceControl = () => useContext(VoiceContext);