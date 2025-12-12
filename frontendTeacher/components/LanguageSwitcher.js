import { useLanguage } from '../context/LanguageContext';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Languages } from 'lucide-react-native';
import { COLORS } from '../constants/colors';
import { StyledButton } from './StyledButton';

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
      variant='ghost'
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
    borderRadius: 8, 
    paddingVertical: 10,
    paddingHorizontal: 16,
    ...Platform.select({
      ios: { shadowColor: COLORS.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4 },
      android: { elevation: 5 },
      web: { boxShadow: '0px 4px 12px rgba(0,0,0,0.15)' }
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
