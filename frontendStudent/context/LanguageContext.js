import { createContext, useContext, useState } from 'react';
import { STRINGS } from '../constants/strings';

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage debe ser usado dentro de un LanguageProvider');
  }
  return context;}

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('es'); // 'es' como default

  const toggleLanguage = (lang) => {
    setLanguage(lang);
  };

  // Función 't' para traducción
  const t = (key) => {
    return STRINGS[language][key] || key;
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