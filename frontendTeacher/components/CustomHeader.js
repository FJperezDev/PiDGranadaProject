import React, { useState, useContext } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Platform, 
  Modal, 
  TextInput, 
  Alert, 
  ActivityIndicator, 
  ScrollView, 
  KeyboardAvoidingView,
  TouchableWithoutFeedback
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { BookMarked, ChevronLeft, Settings, LogOut, Globe, Lock, X, Save, ArrowLeft } from 'lucide-react-native';
import { COLORS } from '../constants/colors';
import { AuthContext } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { LanguageSwitcher } from './LanguageSwitcher';
import { changePassword } from '../api/authRequests'; 
import { StyledButton } from './StyledButton';
import { encryptPassword } from '../utils/encryption';

export const CustomHeader = ({ routeName }) => {
  const { loggedUser, logout } = useContext(AuthContext);
  const { t } = useLanguage();
  const navigation = useNavigation();
  
  const [modalVisible, setModalVisible] = useState(false);
  const [isPasswordMode, setIsPasswordMode] = useState(false);
  const [loading, setLoading] = useState(false);

  // Estados del formulario
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState(''); 
  
  // Estado para el mensaje de error del servidor
  const [serverError, setServerError] = useState(''); 

  const passwordsMatch = newPassword === confirmPassword;
  const showMismatchError = newPassword.length > 0 && confirmPassword.length > 0 && !passwordsMatch;

  const isHome = routeName === 'Home';
  
  const handleGoBack = () => {
    if (navigation.canGoBack()) navigation.goBack();
    else navigation.navigate('Home');
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setIsPasswordMode(false);
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword(''); 
    setServerError(''); // Limpiar errores
    setLoading(false);
  };

  // Función auxiliar para limpiar errores al escribir
  const handleInputChange = (setter) => (text) => {
      setter(text);
      if (serverError) setServerError(''); // Ocultar error si el usuario edita
  };

  const handlePasswordChange = async () => {
    // 1. Validaciones locales
    if (!oldPassword || !newPassword || !confirmPassword) {
      setServerError(t('fillAllFields') || 'Por favor rellena todos los campos');
      return;
    }

    if (!passwordsMatch) {
      setServerError(t('passwordsDoNotMatch') || 'Las contraseñas no coinciden');
      return;
    }

    setLoading(true);
    setServerError(''); // Limpiar errores previos

    // 2. Llamada a API
    const encryptedOld = await encryptPassword(oldPassword);
    const encryptedNew = await encryptPassword(newPassword);

    const result = await changePassword(encryptedOld, encryptedNew); 
    setLoading(false);

    // 3. Manejo de Respuesta
    if (result.success) {
      Alert.alert('Éxito', t('passwordChanged') || 'Contraseña actualizada correctamente');
      handleCloseModal();
    } else {
      // --- LOGICA DE EXTRACCIÓN LIMPIA ---
      let errorMessage = 'Error al cambiar la contraseña';
      const errData = result.error;

      if (errData) {
          // A. Error específico de Django en la contraseña NUEVA (ej: muy común, muy corta)
          if (errData.new_password && Array.isArray(errData.new_password)) {
              errorMessage = errData.new_password[0]; 
          } 
          // B. Error específico en la contraseña ANTIGUA (ej: incorrecta)
          else if (errData.old_password && Array.isArray(errData.old_password)) {
              errorMessage = errData.old_password[0];
          } 
          // C. Error genérico (detail)
          else if (errData.detail) {
              errorMessage = errData.detail;
          }
          // D. Si devuelve un mensaje directo
          else if (typeof errData.message === 'string') {
              errorMessage = errData.message;
          }
      }
      
      // Traducción manual de errores comunes de Django (Opcional, para que quede más bonito)
      if (errorMessage.includes("too common")) errorMessage = "La contraseña es demasiado común.";
      if (errorMessage.includes("too short")) errorMessage = "La contraseña es muy corta.";
      if (errorMessage.includes("entirely numeric")) errorMessage = "La contraseña no puede ser solo números.";

      // Seteamos el estado
      setServerError(errorMessage);
    }
  };

  return (
    <View style={styles.container}>
      {/* SECCIÓN IZQUIERDA */}
      <View style={styles.leftSection}>
        {loggedUser.username ? (
          isHome ? (
            <View style={styles.iconButton}><BookMarked size={28} color={COLORS.black} /></View>
          ) : (
            <StyledButton onPress={handleGoBack} activeOpacity={0.7} style={styles.iconButton} icon={<ChevronLeft size={28} color={COLORS.black} />} />
          )
        ) : (
          <View style={styles.iconButton}><BookMarked size={28} color={COLORS.black} /></View>
        )}
      </View>

      {/* SECCIÓN CENTRAL */}
      <View style={styles.centerSection}>
        <Text style={styles.title}>
          {loggedUser.username ? `${loggedUser.username}_iOrg` : t('appName')} 
        </Text>
      </View>

      {/* SECCIÓN DERECHA */}
      <View style={styles.rightSection}>
        {loggedUser.username ? (
          <StyledButton 
            onPress={() => setModalVisible(true)} 
            style={styles.settingsButton} 
            icon={<Settings size={26} color={COLORS.black} />}
          />
        ) : (
          <LanguageSwitcher />
        )}
      </View>

      {/* --- MODAL DE AJUSTES --- */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={handleCloseModal}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay} 
        >
          <TouchableWithoutFeedback onPress={handleCloseModal}>
            <View style={styles.touchableBackground} /> 
          </TouchableWithoutFeedback>

          <View style={styles.modalContent}>
            
            {/* HEADER MODAL */}
            <View style={styles.modalHeader}>
              {isPasswordMode ? (
                <StyledButton 
                  onPress={() => setIsPasswordMode(false)} 
                  icon={<ArrowLeft size={24} color={COLORS.text} />} 
                  style={styles.backButton}
                >
                  <Text style={styles.backButtonText}>{t('back') || 'Volver'}</Text>
                </StyledButton>
              ) : (
                <Text style={styles.modalTitle}>{t('settings') || 'Ajustes'}</Text>
              )}
              <StyledButton 
                onPress={handleCloseModal}
                icon={<X size={24} color={COLORS.textSecondary || '#666'} />}
                style={styles.closeButton}
              />
            </View>

            <ScrollView 
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 20 }}
              keyboardShouldPersistTaps="handled"
            >
              {!isPasswordMode ? (
                // --- MENÚ PRINCIPAL ---
                <View style={styles.menuContainer}>
                  <View style={styles.cardItem}>
                    <View style={styles.rowLabel}>
                      <Globe size={20} color={COLORS.primary} />
                      <Text style={styles.modalLabel}>{t('language') || 'Idioma'}</Text>
                    </View>
                    <View style={{ transform: [{ scale: 0.9 }], marginRight: -10 }}>
                        <LanguageSwitcher /> 
                    </View>
                  </View>

                  <StyledButton 
                    style={styles.menuButton} 
                    onPress={() => setIsPasswordMode(true)}
                  >
                    <View style={styles.rowLabel}>
                      <Lock size={20} color={COLORS.text} />
                      <Text style={styles.modalButtonText}>{t('changePassword') || 'Cambiar Contraseña'}</Text>
                    </View>
                    <ChevronLeft size={20} color={COLORS.textSecondary || '#ccc'} style={{ transform: [{ rotate: '180deg' }] }} />
                  </StyledButton>

                  <View style={styles.divider} />

                  <StyledButton
                    style={[styles.menuButton, styles.logoutButton]} 
                    onPress={() => { handleCloseModal(); logout(); }}
                  >
                    <View style={styles.rowLabel}>
                      <LogOut size={20} color={COLORS.danger} />
                      <Text style={[styles.modalButtonText, {color: COLORS.danger}]}>
                        {t('logout') || 'Cerrar Sesión'}
                      </Text>
                    </View>
                  </StyledButton>
                </View>
              ) : (
                // --- FORMULARIO CAMBIO PASSWORD ---
                <View style={styles.formContainer}>
                  
                  {/* Password Actual */}
                  <Text style={styles.inputLabel}>{t('currentPassword') || 'Contraseña Actual'}</Text>
                  <TextInput 
                    style={styles.input}
                    secureTextEntry
                    value={oldPassword}
                    onChangeText={handleInputChange(setOldPassword)}
                    placeholder="******"
                    placeholderTextColor="#999"
                  />

                  {/* Password Nueva */}
                  <Text style={styles.inputLabel}>{t('newPassword') || 'Nueva Contraseña'}</Text>
                  <TextInput 
                    style={styles.input}
                    secureTextEntry
                    value={newPassword}
                    onChangeText={handleInputChange(setNewPassword)}
                    placeholder="******"
                    placeholderTextColor="#999"
                  />

                  {/* Confirmar Password */}
                  <Text style={styles.inputLabel}>{t('confirmPassword') || 'Confirmar Nueva Contraseña'}</Text>
                  <TextInput 
                    style={[styles.input, showMismatchError && styles.inputError]} 
                    secureTextEntry
                    value={confirmPassword}
                    onChangeText={handleInputChange(setConfirmPassword)}
                    placeholder="******"
                    placeholderTextColor="#999"
                  />

                  {/* Error de coincidencia (local) */}
                  {showMismatchError && (
                    <Text style={styles.errorText}>
                      {t('passwordsDoNotMatch') || 'Las contraseñas no coinciden'}
                    </Text>
                  )}

                  {/* ERROR DEL SERVIDOR (Aquí mostramos "Password too common") */}
                  {serverError ? (
                    <View style={styles.serverErrorBox}>
                         <Text style={styles.serverErrorText}>{serverError}</Text>
                    </View>
                  ) : null}

                  <StyledButton 
                    style={[
                      styles.saveButton, 
                      (loading || showMismatchError) && styles.disabledButton
                    ]} 
                    onPress={handlePasswordChange}
                    disabled={loading || showMismatchError} 
                  >
                    {loading ? (
                      <ActivityIndicator color={COLORS.surface} />
                    ) : (
                      <>
                        <Save size={20} color={COLORS.surface} />
                        <Text style={styles.saveButtonText}>{t('save') || 'Guardar'}</Text>
                      </>
                    )}
                  </StyledButton>
                </View>
              )}
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  // ... Tus estilos existentes ...
  container: { 
    width: '100%', 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    backgroundColor: COLORS.primary, 
    padding: 16, 
    borderBottomWidth: 1, 
    borderBottomColor: COLORS.secondary, 
    ...Platform.select({
      ios: { shadowColor: COLORS.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4 },
      android: { elevation: 5 },
      web: { boxShadow: '0px 4px 12px rgba(0,0,0,0.15)' }
    }),
  },
  leftSection: { flex: 1, alignItems: 'flex-start' },
  centerSection: { flex: 2, alignItems: 'center', justifyContent: 'center' },
  rightSection: { flex: 1, alignItems: 'flex-end', flexDirection: 'row', justifyContent: 'flex-end' },
  title: { fontSize: 20, fontWeight: 'bold', color: COLORS.text },
  iconButton: { 
    backgroundColor: COLORS.white, 
    borderColor: COLORS.secondary, 
    borderWidth: 1, 
    borderRadius: 8, 
    padding: 6, 
    elevation: 2 
  },
  settingsButton: { padding: 8 },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', 
    justifyContent: 'center',
    alignItems: 'center',
  },
  touchableBackground: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  modalContent: {
    width: '90%',
    maxWidth: 450, 
    maxHeight: '85%', 
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    padding: 24,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
      android: { elevation: 10 },
    }),
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingBottom: 15,
  },
  modalTitle: { fontSize: 22, fontWeight: '800', color: COLORS.text },
  backButton: { flexDirection: 'row', alignItems: 'center' },
  backButtonText: { marginLeft: 8, fontSize: 16, color: COLORS.text, fontWeight: '600' },
  closeButton: { padding: 4, backgroundColor: '#f5f5f5', borderRadius: 20 },
  
  menuContainer: { gap: 12 },
  cardItem: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#FAFAFA', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#EEEEEE',
  },
  menuButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 16, borderRadius: 16, backgroundColor: '#FAFAFA', borderWidth: 1, borderColor: '#EEEEEE',
  },
  logoutButton: { backgroundColor: '#FFF5F5', borderColor: '#FFE0E0', marginTop: 8 },
  rowLabel: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  modalLabel: { fontSize: 16, fontWeight: '600', color: COLORS.text },
  modalButtonText: { fontSize: 16, fontWeight: '500', color: COLORS.text },
  divider: { height: 1, backgroundColor: '#EEEEEE', marginVertical: 5 },

  formContainer: { gap: 16, paddingTop: 5 },
  inputLabel: { fontSize: 14, fontWeight: '700', color: COLORS.text, marginLeft: 4, marginBottom: -8 },
  input: {
    borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12,
    fontSize: 16, backgroundColor: '#FAFAFA', color: COLORS.text,
  },
  inputError: { borderColor: COLORS.danger, backgroundColor: '#FFF5F5' },
  errorText: { color: COLORS.danger, fontSize: 13, fontWeight: '600', marginLeft: 4 },
  
  // ESTILOS NUEVOS PARA EL ERROR DEL SERVIDOR
  serverErrorBox: {
      backgroundColor: '#FEF2F2',
      borderWidth: 1,
      borderColor: '#F87171',
      borderRadius: 8,
      padding: 10,
      marginTop: 5,
  },
  serverErrorText: {
      color: '#B91C1C',
      fontSize: 14,
      textAlign: 'center',
      fontWeight: '500',
  },

  saveButton: {
    flexDirection: 'row', backgroundColor: COLORS.primary, paddingVertical: 14, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center', marginTop: 10,
    shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5, elevation: 4,
  },
  disabledButton: { opacity: 0.6, backgroundColor: '#A0A0A0', shadowOpacity: 0, elevation: 0 },
  saveButtonText: { color: COLORS.surface, fontSize: 17, fontWeight: 'bold', marginLeft: 8 },
});