import { useLanguage } from '../context/LanguageContext';
import { useVoiceControl } from '../context/VoiceContext';
import { LanguageSwitcher } from './LanguageSwitcher';
import { ChevronLeft, BookMarked, LogOutIcon, Mic, MicOff } from 'lucide-react-native';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { COLORS } from '../constants/colors';
import { StyledButton } from '../components/StyledButton';

export const CustomHeader = ({routeName}) => {
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

  return (
    <View style={styles.container}>
      {/* Left Section */}
      <View style={styles.leftSection}>
        
        {!hideBack && isHome ? (
          <StyledButton
            activeOpacity={0.7}
            style={styles.iconButton}
          >
            <BookMarked size={28} color={COLORS.black} />
          </StyledButton>
        ): !hideBack && (
          <StyledButton
            onPress={() => (logout ? navigation.navigate('Home') : handleGoBack())}
            activeOpacity={0.7}
            style={styles.iconButton}
          >
            {isHome ? (
              <BookMarked size={28} color={COLORS.black} />
            ) : logout ? (
              <LogOutIcon
                size={28}
                color={COLORS.black}
                style={{ transform: [{ rotate: '180deg' }] }}
              />
            ) : (
              <ChevronLeft size={28} color={COLORS.black} />
            )
            }
          </StyledButton>
          
        )}
      </View>

      {/* Center Section */}
      <View style={styles.centerSection}>
        <Text style={styles.title}>{t('appName')}</Text>
      </View>

      {/* Right Section */}
      <View style={styles.rightSection}>
        <StyledButton 
          onPress={toggleListening}
          style={[
              styles.micButton, 
              isListening && styles.micButtonActive
          ]}
        >
          {isListening ? (
              <Mic size={20} color="#fff" />
          ) : (
              <MicOff size={20} color={COLORS.text} />
          )}
        </StyledButton>
        
        <LanguageSwitcher />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.primary, // tu color cyan-50
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.secondary,
    shadowColor: COLORS.black,
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  leftSection: {
    flex: 1,
    alignItems: 'flex-start',
  },
  centerSection: {
    flex: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightSection: {
    flex: 1,
    alignItems: 'flex-end',
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  iconButton: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.secondary,
    borderWidth: 1,
    borderRadius: 999,
    padding: 6,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },

  micButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f1f5f9', // slate-100
    marginLeft: 8,
  },
  micButtonActive: {
    backgroundColor: '#ef4444', // red-500
  }
});
