import { useLanguage } from '../context/LanguageContext';
import { View, Text, TouchableOpacity } from 'react-native';
import { Languages } from 'lucide-react-native';
 
export const LanguageSwitcher = () => {
  const { language, toggleLanguage } = useLanguage();
 
  const handleToggle = () => {
    const newLang = language === 'es' ? 'en' : 'es';
    toggleLanguage(newLang);
  };
 
  return (
    <TouchableOpacity
      onPress={handleToggle}
      className="flex-row items-center justify-center border border-slate-400 rounded-full p-2"
    >
      <Languages size={18} className="text-black" />
      <Text className="text-black font-bold ml-2 text-sm">{language === 'es' ? 'EN' : 'ES'}</Text>
    </TouchableOpacity>
  );
};