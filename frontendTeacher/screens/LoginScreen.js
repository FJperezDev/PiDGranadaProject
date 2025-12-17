import React, { useContext, useState, useEffect } from 'react';
import {
  View, Text, TextInput, StyleSheet, KeyboardAvoidingView,
  Platform, ScrollView, Dimensions
} from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { COLORS } from '../constants/colors';
import { useLanguage } from '../context/LanguageContext';
import { StyledButton } from '../components/StyledButton';
import { Eye, EyeOff } from 'lucide-react-native'; 
import { encryptPassword } from '../utils/encryption';

export default function LoginScreen({ navigation }) {
  const { login, isAuthenticated } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { t } = useLanguage();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const securePassword = encryptPassword(password);
      await login(email, securePassword);
      
    } catch (error) {
      console.error("Login failed", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      navigation.replace('Home');
    }
  }, [isAuthenticated]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1, backgroundColor: COLORS.background }}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.card}>
          <Text style={styles.title}>{t('login')}</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t('email')}</Text>
            <TextInput
              testID="input-login-email"
              style={styles.input}
              placeholder="example@email.com"
              placeholderTextColor={COLORS.textSecondary}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t('password')}</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                testID="input-login-password"
                style={styles.passwordInput}
                secureTextEntry={!showPassword}
                placeholder="******"
                placeholderTextColor={COLORS.textSecondary}
                value={password}
                onChangeText={setPassword}
              />
              <StyledButton
		            testId="toggle-login-visibility"
                onPress={() => setShowPassword(!showPassword)}
                variant="ghost"
                style={styles.eyeButton}
                icon={showPassword ? <EyeOff size={20} color={COLORS.textSecondary} /> : <Eye size={20} color={COLORS.textSecondary} />}
              />
            </View>
          </View>

          <StyledButton
            testId="button-login"
            title={t('login')}
            onPress={handleLogin}
            loading={loading}
            size="large"
            style={{ marginTop: 20 }}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 400, 
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 30,
    ...Platform.select({
      ios: { shadowColor: COLORS.shadow, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10 },
      android: { elevation: 5 },
      web: { boxShadow: '0px 4px 20px rgba(0,0,0,0.1)' },
    }),
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 30,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    fontSize: 16,
    color: COLORS.text,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
    borderRadius: 8,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: COLORS.text,
  },
  eyeButton: {
    padding: 10,
  },
});
