import { KeyboardAvoidingView, Platform } from 'react-native';
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
  const { t, language } = useLanguage();
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const handleJoinGroup = async () => {
    if (isLoading) return;
    setIsLoading(true);
    setError('');
    
    try {
      const response = await mockApi.validateStudentGroupCode(code);
      if (response.exists) {
        navigation.navigate('Subject', { code });
      } else {
        setError(t('invalidCode'));
      }
    }
    catch (err) {
      setError(t('errorConnection'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.card}>
        <StyledTextInput
          placeholder={t('subjectCode')}
          value={code}
          onChangeText={setCode} // Ojo: TextInput usa onChangeText, no onChange
          autoCapitalize="characters"
          style={{marginBottom: 16}}
        />
        
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <StyledButton
          title={t('joinGroup')}
          onPress={handleJoinGroup}
          loading={isLoading}
          variant="primary" // Usamos la variante
          size="large"
          style={{ width: '100%' }}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: COLORS.background,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: COLORS.surface,
    padding: 24,
    borderRadius: 24,
    elevation: 4,
    shadowColor: COLORS.shadow,
    shadowOpacity: 0.1,
    shadowRadius: 10,
    alignItems: 'center'
  },
  errorText: {
    color: COLORS.error,
    marginBottom: 16,
    textAlign: 'center',
    fontWeight: '500'
  },
});