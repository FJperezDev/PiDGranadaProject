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

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState(''); 
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
    setServerError('');
    setLoading(false);
  };

  const handleInputChange = (setter) => (text) => {
      setter(text);
      if (serverError) setServerError('');
  };

  const handlePasswordChange = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      setServerError(t('fillAllFields'));
      return;
    }

    if (!passwordsMatch) {
      setServerError(t('passwordsDoNotMatch'));
      return;
    }

    setLoading(true);
    setServerError('');

    const encryptedOld = await encryptPassword(oldPassword);
    const encryptedNew = await encryptPassword(newPassword);

    const result = await changePassword(encryptedOld, encryptedNew); 
    setLoading(false);

    if (result.success) {
      Alert.alert(t('success'), t('passwordChanged'));
      handleCloseModal();
    } else {
      let errorMessage = t('error');
      const errData = result.error;

      if (errData) {
          if (errData.new_password && Array.isArray(errData.new_password)) {
              errorMessage = errData.new_password[0]; 
          } 
          else if (errData.old_password && Array.isArray(errData.old_password)) {
              errorMessage = errData.old_password[0];
          } 
          else if (errData.detail) {
              errorMessage = errData.detail;
          }
          else if (typeof errData.message === 'string') {
              errorMessage = errData.message;
          }
      }
      setServerError(errorMessage);
    }
  };

  return (
    <View style={styles.container}>
      {/* SECCIÓN IZQUIERDA */}
      <View style={styles.leftSection}>
        {loggedUser.username ? (
          isHome ? (
            <StyledButton variant="ghost" style={styles.iconButton} disabled={true}>
                <BookMarked size={28} color={COLORS.black} />
            </StyledButton>
          ) : (
            <StyledButton 
                onPress={handleGoBack} 
                variant="ghost" 
                style={styles.iconButton} 
                icon={<ChevronLeft size={28} color={COLORS.black} />} 
            />
          )
        ) : (
            <StyledButton variant="ghost" style={styles.iconButton} disabled={true}>
                <BookMarked size={28} color={COLORS.black} />
            </StyledButton>
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
            variant="ghost"
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
                  variant="ghost"
                >
                  <Text style={styles.backButtonText}>{t('back')}</Text>
                </StyledButton>
              ) : (
                <Text style={styles.modalTitle}>{t('settings')}</Text>
              )}
              <StyledButton 
                onPress={handleCloseModal}
                icon={<X size={24} color={COLORS.textSecondary} />}
                variant="ghost"
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
                      <Text style={styles.modalLabel}>{t('language')}</Text>
                    </View>
                    <View style={{ transform: [{ scale: 0.9 }], marginRight: -10 }}>
                        <LanguageSwitcher /> 
                    </View>
                  </View>

                  <StyledButton 
                    style={styles.menuButton} 
                    onPress={() => setIsPasswordMode(true)}
                    variant="ghost"
                  >
                    <View style={styles.rowLabel}>
                      <Lock size={20} color={COLORS.text} />
                      <Text style={styles.modalButtonText}>{t('changePassword')}</Text>
                    </View>
                    <ChevronLeft size={20} color={COLORS.textSecondary} style={{ transform: [{ rotate: '180deg' }] }} />
                  </StyledButton>

                  <View style={styles.divider} />

                  <StyledButton
                    style={[styles.menuButton, styles.logoutButton]} 
                    onPress={() => { handleCloseModal(); logout(); }}
                    variant="ghost"
                  >
                    <View style={styles.rowLabel}>
                      <LogOut size={20} color={COLORS.danger} />
                      <Text style={[styles.modalButtonText, {color: COLORS.danger}]}>
                        {t('logout')}
                      </Text>
                    </View>
                  </StyledButton>
                </View>
              ) : (
                // --- FORMULARIO CAMBIO PASSWORD ---
                <View style={styles.formContainer}>
                  
                  {/* Password Actual */}
                  <Text style={styles.inputLabel}>{t('currentPassword')}</Text>
                  <TextInput 
                    style={styles.input}
                    secureTextEntry
                    value={oldPassword}
                    onChangeText={handleInputChange(setOldPassword)}
                    placeholder="******"
                    placeholderTextColor="#999"
                  />

                  {/* Password Nueva */}
                  <Text style={styles.inputLabel}>{t('newPassword')}</Text>
                  <TextInput 
                    style={styles.input}
                    secureTextEntry
                    value={newPassword}
                    onChangeText={handleInputChange(setNewPassword)}
                    placeholder="******"
                    placeholderTextColor="#999"
                  />

                  {/* Confirmar Password */}
                  <Text style={styles.inputLabel}>{t('confirmPassword')}</Text>
                  <TextInput 
                    style={[styles.input, showMismatchError && styles.inputError]} 
                    secureTextEntry
                    value={confirmPassword}
                    onChangeText={handleInputChange(setConfirmPassword)}
                    placeholder="******"
                    placeholderTextColor="#999"
                  />

                  {showMismatchError && (
                    <Text style={styles.errorText}>
                      {t('passwordsDoNotMatch')}
                    </Text>
                  )}

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
                    icon={loading ? null : <Save size={20} color={COLORS.surface} />}
                  >
                    {loading ? (
                      <ActivityIndicator color={COLORS.surface} />
                    ) : (
                        <Text style={styles.saveButtonText}>{t('save')}</Text>
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