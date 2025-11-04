import {useLanguage} from '../context/LanguageContext';
import { LanguageSwitcher } from './LanguageSwitcher';
import { ChevronLeft, BookMarked } from 'lucide-react-native';
import { StyledButton } from './StyledButton';
import { View, Text } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

export const CustomHeader = ({ onGoBack }) => {
  const { t } = useLanguage();
  const navigation = useNavigation();
  const route = useRoute();
  const routeName = route.name;

  const handleGoBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('Home');
    }
  };

  return (

    <View
      style={{
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#ecfeff', // cyan-50
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#cbd5e1', // slate-300
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 2,
      }}
    >
      {/* Left Section */}
      <View style={{ flex: 1, alignItems: 'flex-start' }}>
        <StyledButton onPress={handleGoBack}>
          {routeName === 'Home' ? (
            <BookMarked size={32} color="black" />
          ) : (
            <ChevronLeft size={32} color="black" />
          )}
        </StyledButton>
      </View>

      {/* Center Section */}
      <View style={{ flex: 2, alignItems: 'center' }}>
        <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#000' }}>
          {t('appName')}
        </Text>
      </View>

      {/* Right Section */}
      <View style={{ flex: 1, alignItems: 'flex-end', flexDirection: 'row', justifyContent: 'flex-end' }}>
        <Text style={{ marginRight: 8 }}>🌍</Text>
        <LanguageSwitcher />
      </View>
    </View>
  );
};