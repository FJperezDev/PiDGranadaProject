import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Languages } from 'lucide-react-native';
import { COLORS } from '../constants/colors';
import { StyledButton } from '../components/StyledButton';
import { useLanguage } from '../context/LanguageContext';

export const LanguageSwitcher = () => {
  const { language, toggleLanguage } = useLanguage();

  const handleToggle = () => {
    toggleLanguage(language === 'es' ? 'en' : 'es');
  };

  return (
    <StyledButton
      onPress={handleToggle}
      variant="secondary" // Fondo blanco, borde sutil
      size="small"       // Más compacto
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
    // Quitamos estilos manuales porque variant="secondary" ya pone borde y fondo
    paddingHorizontal: 12, // Ajuste fino
    height: 40, // Altura fija para alinear con el micro
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6, // Espacio moderno entre icono y texto
  },
  text: {
    color: COLORS.text,
    fontWeight: '700',
    fontSize: 14,
  },
});