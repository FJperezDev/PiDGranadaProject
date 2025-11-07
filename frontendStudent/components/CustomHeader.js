import { useLanguage } from '../context/LanguageContext';
import { LanguageSwitcher } from './LanguageSwitcher';
import { ChevronLeft, BookMarked } from 'lucide-react-native';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { COLORS } from '../constants/colors';

export const CustomHeader = ({routeName}) => {
  const { t } = useLanguage();
  const navigation = useNavigation();

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
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.iconButton}
          >
            <BookMarked size={28} color={COLORS.black} />
          </TouchableOpacity>
        ): !hideBack && (
          <TouchableOpacity
            onPress={() => (logout ? navigation.navigate('Home') : handleGoBack())}
            activeOpacity={0.7}
            style={styles.iconButton}
          >
            {isHome ? (
              <BookMarked size={28} color={COLORS.black} />
            ) : (
              <ChevronLeft size={28} color={COLORS.black} />
            )}
          </TouchableOpacity>
        )}
      </View>

      {/* Center Section */}
      <View style={styles.centerSection}>
        <Text style={styles.title}>{t('appName')}</Text>
      </View>

      {/* Right Section */}
      <View style={styles.rightSection}>
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
});
