import { useLanguage } from "../context/LanguageContext";
import { useState } from 'react';
import { mockApi } from '../services/api';
import { StyledTextInput } from '../components/StyledTextInput';
import { StyledButton } from '../components/StyledButton';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from "../constants/colors";

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
      navigation.navigate('Subject', { code });
    }
    catch (err) {
      setError(t('errorConnection'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StyledTextInput
        placeholder={t('subjectCode')}
        value={code}
        onChange={setCode}
        autoCapitalize="characters"
        style={styles.input}
      />
      
      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <StyledButton
        title={isLoading ? t('loading') : t('joinGroup')}
        onPress={handleJoinGroup}
        style={styles.joinButton}
        disabled={isLoading}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: COLORS.background || '#fff',
  },
  errorText: {
    color: 'red',
    marginTop: 16,
    textAlign: 'center',
    fontSize: 14,
  },
  joinButton: {
    marginTop: 24,
  },
  input: {
    height: 50,
    width: '50%',
    alignContent: 'center',
    textAlign: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 12,
  },
});
