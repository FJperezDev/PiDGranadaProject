import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, Platform, StatusBar } from 'react-native';
import { ChevronLeft, BookMarked, LogOutIcon, Mic, MicOff } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../constants/colors';
import { StyledButton } from '../components/StyledButton';
import { useLanguage } from '../context/LanguageContext';
import { useVoiceControl } from '../context/VoiceContext';
import { LanguageSwitcher } from './LanguageSwitcher';

export const CustomHeader = ({ routeName }) => {
  const { t } = useLanguage();
  const navigation = useNavigation();
  const { isListening, toggleListening } = useVoiceControl();

  const handleGoBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('Home');
    }
  };

  const hideBack = routeName === 'Exam' || routeName === 'ExamResult';
  const logout = routeName === 'Subject';
  const isHome = routeName === 'Home';

  // Lógica para el icono izquierdo
  const renderLeftIcon = () => {
    if (hideBack && !isHome) return <View style={styles.placeholderIcon} />;

    const IconComponent = isHome ? BookMarked : (logout ? LogOutIcon : ChevronLeft);
    const onPressAction = isHome ? undefined : () => (logout ? navigation.navigate('Home') : handleGoBack());
    
    // Si es Home, mostramos solo el icono decorativo o acción si la hubiera
    // Si no es Home, es un botón navegable
    return (
      <StyledButton
        onPress={onPressAction}
        variant="secondary" // Círculo blanco
        style={styles.iconButton}
        // Si es Home y no hace nada, desactivamos feedback visual excesivo
        disabled={isHome} 
      >
        <IconComponent 
          size={24} 
          color={COLORS.text} 
          style={logout ? { transform: [{ rotate: '180deg' }] } : {}}
        />
      </StyledButton>
    );
  };

  return (
    <View style={styles.headerContainer}>
      {/* Ajuste para Status Bar en Android si es necesario, 
          aunque SafeAreaView suele encargarse en contenedores padre */}
      <View style={styles.container}>
        
        {/* IZQUIERDA */}
        <View style={styles.leftSection}>
          {renderLeftIcon()}
        </View>

        {/* CENTRO */}
        <View style={styles.centerSection}>
          <Text style={styles.title} numberOfLines={1}>
            {t('appName')}
          </Text>
        </View>

        {/* DERECHA */}
        <View style={styles.rightSection}>
          {/* Botón Micrófono */}
          <StyledButton 
            onPress={toggleListening}
            // Rojo si escucha, Transparente (ghost) si no
            variant={isListening ? "danger" : "ghost"} 
            style={[
              styles.micButton,
              // Si no escucha, le damos un fondo sutil semitransparente en lugar de ghost puro
              !isListening && { backgroundColor: 'rgba(255,255,255,0.5)' } 
            ]}
          >
            {isListening ? (
                <Mic size={20} color={COLORS.white} />
            ) : (
                <MicOff size={20} color={COLORS.text} />
            )}
          </StyledButton>
          
          <LanguageSwitcher />
        </View>

      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: COLORS.primary,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.secondary, // Slate-400
    // Sombra suave para separar del contenido
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 4,
    zIndex: 100,
    // Padding superior para respetar el Status Bar en algunos Androids sin SafeArea
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0,
  },
  container: {
    height: 64, // Altura estándar cómoda
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  
  // Secciones Flexibles
  leftSection: {
    flex: 1,
    alignItems: 'flex-start',
  },
  centerSection: {
    flex: 2, // Más espacio para el título
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightSection: {
    flex: 1.5, // Un poco más de espacio a la derecha por tener 2 botones
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8, // Espacio uniforme entre micro e idioma
  },

  // Elementos
  title: {
    fontSize: 20,
    fontWeight: '800', // Extra bold para el nombre de la app
    color: COLORS.text, // Slate-900 para contraste
    letterSpacing: 0.5,
  },
  
  // Botones
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22, // Redondo perfecto
    paddingHorizontal: 0,
    paddingVertical: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderIcon: {
    width: 44, 
    height: 44,
  },
  micButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    paddingHorizontal: 0,
    paddingVertical: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
});