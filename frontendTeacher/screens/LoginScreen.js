import React, { useContext, useState, useEffect } from 'react';
import {
  View, Text, TextInput, StyleSheet, KeyboardAvoidingView,
  Platform, ScrollView
} from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { COLORS } from '../constants/colors';
import { useLanguage } from '../context/LanguageContext';
import { StyledButton } from '../components/StyledButton';
import { Eye, EyeOff, AlertCircle } from 'lucide-react-native'; // Importa AlertCircle si quieres un icono
import { encryptPassword } from '../utils/encryption';

export default function LoginScreen({ navigation }) {
  const { login, isAuthenticated } = useContext(AuthContext);
  const { t } = useLanguage();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // 1. Nuevo estado para el mensaje de error
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async () => {
    // Limpiamos errores previos al intentar de nuevo
    setErrorMessage('');
    setLoading(true);
    
    try {
      const securePassword = encryptPassword(password);
      await login(email, securePassword);
      
    } catch (error) {
      console.error("Login failed", error);
      
      // 2. Determinamos qué mensaje mostrar
      let msg = "Credenciales incorrectas o error de servidor.";
      
      // Si el backend te devuelve un mensaje específico (ej: "No active account found")
      if (error.response?.data?.detail) {
        msg = error.response.data.detail;
      } else if (error.message === "Network Error") {
        msg = "Verifica tu conexión a internet.";
      }

      setErrorMessage(msg);

      // 3. Lógica "Temporalmente": El mensaje desaparece a los 4 segundos
      setTimeout(() => {
        setErrorMessage('');
      }, 4000);

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      navigation.replace('Home');
    }
  }, [isAuthenticated]);

  // Función auxiliar para limpiar error al escribir
  const handleInputChange = (setter) => (text) => {
    setter(text);
    if (errorMessage) setErrorMessage(''); // Borra el error apenas el usuario corrige
  };

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
              style={[styles.input, errorMessage && styles.inputError]} // Borde rojo opcional
              placeholder="ejemplo@correo.com"
              placeholderTextColor={COLORS.textSecondary}
              value={email}
              // Limpiamos el error al escribir
              onChangeText={handleInputChange(setEmail)}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t('password')}</Text>
            <View style={[styles.passwordContainer, errorMessage && styles.inputError]}>
              <TextInput
                style={styles.passwordInput}
                secureTextEntry={!showPassword}
                placeholder="******"
                placeholderTextColor={COLORS.textSecondary}
                value={password}
                // Limpiamos el error al escribir
                onChangeText={handleInputChange(setPassword)}
              />
              <StyledButton
                onPress={() => setShowPassword(!showPassword)}
                variant="ghost"
                style={styles.eyeButton}
                icon={showPassword ? <EyeOff size={20} color={COLORS.textSecondary} /> : <Eye size={20} color={COLORS.textSecondary} />}
              />
            </View>
          </View>

          <StyledButton
            title={t('login')}
            onPress={handleLogin}
            loading={loading}
            size="large"
            style={{ marginTop: 20 }}
          />

          {/* 4. Renderizado condicional del mensaje de error */}
          {errorMessage ? (
            <View style={styles.errorContainer}>
              <AlertCircle size={16} color="#FF4444" style={{ marginRight: 6 }} />
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  // ... tus estilos anteriores ...
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
    // ... sombras ...
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
  
  // --- NUEVOS ESTILOS ---
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 15,
    padding: 10,
    backgroundColor: '#FF444415', // Rojo muy suave de fondo
    borderRadius: 8,
  },
  errorText: {
    color: '#FF4444', // Rojo fuerte
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  inputError: {
    borderColor: '#FF4444', // Borde rojo en inputs cuando hay error
  }
});