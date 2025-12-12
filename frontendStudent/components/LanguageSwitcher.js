import { useLanguage } from '../context/LanguageContext';
import { View, Text, StyleSheet } from 'react-native';
import { Languages } from 'lucide-react-native';
import { COLORS } from '../constants/colors';
import { StyledButton } from '../components/StyledButton';

export const LanguageSwitcher = () => {
  const { language, toggleLanguage } = useLanguage();

  const handleToggle = () => {
    const newLang = language === 'es' ? 'en' : 'es';
    toggleLanguage(newLang);
  };

  return (
    <StyledButton
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
    </StyledButton>
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
    borderRadius: 999, // totalmente redondeado
    paddingVertical: 10,
    paddingHorizontal: 16,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2, // sombra para Android
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
