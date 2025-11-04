import {useLanguage} from "../context/LanguageContext";
import { useState } from 'react';
import { mockApi } from '../services/api';
import { StyledTextInput } from '../components/StyledTextInput';
import { StyledButton } from '../components/StyledButton';
import { View, Text } from 'react-native';
import {useNavigation} from '@react-navigation/native';

export function HomeScreen() {
  const navigation = useNavigation();
  const { t } = useLanguage();
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleJoinGroup = async () => {
    if (isLoading) return;
    setIsLoading(true);
    setError('');

    try {
      console.log("codeAntes: ", code)
      const response = await mockApi.validateSubjectCode(code);
      if (response.exists) {
        navigation.navigate('Subject', { subjectData: response.subject });
      } else {
        setError(t('invalidCode'));
      }
    } catch (err) {
      setError(t('errorConnection'));
      console.log("Error al validar el código:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="flex-1 flex flex-col items-center justify-center p-5 text-center">
      <StyledTextInput
        placeholder={t('subjectCode')}
        value={code}
        onChange={setCode}
        autoCapitalize="characters"
      />
      
      {error && <Text className="text-red-700 mt-4">{error}</Text>}

      <StyledButton
        title={isLoading ? t('loading') : t('joinGroup')}
        onClick={handleJoinGroup}
        className="mt-6"
        disabled={isLoading}
      />
    </View>
  );
};