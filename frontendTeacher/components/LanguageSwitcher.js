import { useLanguage } from '../context/LanguageContext';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Languages } from 'lucide-react-native';
import { COLORS } from '../constants/colors';

export const LanguageSwitcher = () => {
  const { language, toggleLanguage } = useLanguage();

  const handleToggle = () => {
    const newLang = language === 'es' ? 'en' : 'es';
    toggleLanguage(newLang);
  };

  return (
    <TouchableOpacity
      onPress={handleToggle}
      style={styles.button}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        <Languages size={18} color={COLORS.black} />
      </View>

      <View style={styles.textContainer}>
        <Text style={styles.text}>
          {language === 'es' ? 'ES' : 'EN'}
        </Text>
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
    borderRadius: 999, 
    paddingVertical: 10,
    paddingHorizontal: 16,
    ...(Platform.OS === 'web'
      ? { boxShadow: '0px 1px 2px rgba(0,0,0,0.1)' }
      : {
          shadowColor: COLORS.black,
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 2,
          elevation: 2,
        }),
  },
  iconContainer: {
    flex: 1,
    alignItems: 'flex-start',
  },
  textContainer: {
    flex: 1,
    alignItems: 'flex-end',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    width: '100%',
  },
  text: {
    color: COLORS.black,
    fontWeight: 'bold',
    marginLeft: 8,
    fontSize: 14,
  },
});
