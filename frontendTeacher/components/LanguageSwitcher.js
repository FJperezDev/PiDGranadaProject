import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Languages } from 'lucide-react-native';
import { COLORS } from '../constants/colors';
import { StyledButton } from './StyledButton';
import { useLanguage } from '../context/LanguageContext';

export const LanguageSwitcher = () => {
  const { language, toggleLanguage } = useLanguage();

  const handleToggle = () => {
    toggleLanguage(language === 'es' ? 'en' : 'es');
  };

  return (
    <StyledButton
      onPress={handleToggle}
      variant="secondary"
      size="small"
      style={styles.button}
    >
      <View style={styles.content}>
        <Languages size={18} color={COLORS.text} />
        <Text style={styles.text}>
          {language === 'es' ? 'ES' : 'EN'}
        </Text>
      </View>
    </StyledButton>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 12,
    height: 40,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  text: {
    color: COLORS.text,
    fontWeight: '700',
    fontSize: 14,
  },
});