import { useLanguage } from '../context/LanguageContext';
import { View, Text, TouchableOpacity } from 'react-native';
import { Languages } from 'lucide-react-native';
import { COLORS } from '../constants/colors' 
import { StyleSheet } from 'react-native';

export const LanguageSwitcher = () => {
  const { language, toggleLanguage } = useLanguage();
 
  const handleToggle = () => {
    const newLang = language === 'es' ? 'en' : 'es';
    toggleLanguage(newLang);
  };
 
  return (
    <TouchableOpacity
      onPress={handleToggle}
      style={[
        styles.button,
      ]}
      activeOpacity={0.7}
    >

      <View style={{ flex: 1, alignItems: 'flex-start'}}>
        <Languages size={18} className="text-black" />
      </View>
      
      <View style={{ flex: 1, alignItems: 'flex-end', flexDirection: 'row', justifyContent: 'flex-end', width: '100%'}}>
        <Text className="text-black font-bold ml-2 text-sm">{language === 'es' ? 'ES' : 'EN'}</Text>
      </View>
      
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    borderColor: COLORS.secondary,
    borderWidth: 1.5,
    borderRadius: 999, // súper redondeado (full circle)
    paddingVertical: 10,
    paddingHorizontal: 16,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2, // para Android
  },
  text: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});