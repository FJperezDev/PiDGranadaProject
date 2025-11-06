import { createContext, useContext, useState } from 'react';
import { STRINGS } from '../constants/strings';

const LanguageContext = createContext();

let currentLanguage = 'es';

export const getLanguage = () => currentLanguage;
export const switchLanguage = () => {
  if (currentLanguage === 'es') {
    currentLanguage = 'en';
  } else {
    currentLanguage = 'es';
  }
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage debe ser usado dentro de un LanguageProvider');
  }
  return context;
}

export const LanguageProvider = ({ children }) => {

  const [language, setLanguage] = useState('es'); // 'es' como default

  const toggleLanguage = (lang) => {
    switchLanguage();
    setLanguage(lang);
  };

  // Función 't' para traducción
  const t = (key) => {
    return STRINGS[language]?.[key] || key;
  };

  const value = {
    language,
    toggleLanguage,
    t,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};