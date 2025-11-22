import { useLanguage } from '../context/LanguageContext';
import { LanguageSwitcher } from './LanguageSwitcher';
import { ChevronLeft, BookMarked } from 'lucide-react-native';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { COLORS } from '../constants/colors';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { StyledButton } from '../components/StyledButton';

export const CustomHeader = ({routeName}) => {
  const { loggedUser, logout } = useContext(AuthContext);
  const { t } = useLanguage();
  const navigation = useNavigation();

  const handleGoBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('Home');
    }
  };

  const inLogin = routeName === 'Login';

  return (
    <View style={styles.container}>
      {/* Left Section */}
      <View style={styles.leftSection}>
        {!inLogin ? (
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.iconButton}
          >
            <BookMarked size={28} color={COLORS.black} />
          </TouchableOpacity>
        ): !inLogin && (
          <TouchableOpacity
            onPress={() => (inLogin ? navigation.navigate('Home') : handleGoBack())}
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
        <Text style={styles.title}>{loggedUser.username ? loggedUser.username + "_iOrg" : t('appName')}</Text>
      </View>

      {/* Right Section */}
      <View style={styles.rightSection}>
        {loggedUser.username ? <StyledButton
                  title="OK"
                  onPress={logout}
                /> : <LanguageSwitcher />}
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
    backgroundColor: COLORS.primary,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.secondary,
    ...(Platform.OS === 'web'
      ? { boxShadow: '0px 1px 2px rgba(0,0,0,0.05)' }
      : {
          shadowColor: COLORS.black,
          shadowOpacity: 0.05,
          shadowRadius: 2,
          elevation: 2,
        }),
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
    ...(Platform.OS === 'web'
      ? { boxShadow: '0px 1px 2px rgba(0,0,0,0.15)' }
      : {
          shadowColor: COLORS.black,
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.15,
          shadowRadius: 2,
          elevation: 2,
        }),
  },
});
