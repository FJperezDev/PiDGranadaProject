import React, { useState, useContext } from 'react';
import { 
  View, Text, StyleSheet, Platform, Modal, TextInput, Alert, 
  ScrollView, KeyboardAvoidingView, TouchableWithoutFeedback, StatusBar 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { BookMarked, ChevronLeft, Settings, LogOut, Globe, Lock, X, Save, ArrowLeft } from 'lucide-react-native';
import { COLORS } from '../constants/colors';
import { AuthContext } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { LanguageSwitcher } from './LanguageSwitcher';
import { changePassword } from '../api/authRequests'; 
import { StyledButton } from './StyledButton';
import { StyledTextInput } from './StyledTextInput';
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

  const handlePasswordChange = async () => {
    // ... (Tu lógica original se mantiene igual)
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
        // ... manejo de errores ...
        if (result.error?.detail) errorMessage = result.error.detail;
        setServerError(errorMessage);
      }
  };

  return (
    <View style={styles.headerContainer}>
      <View style={styles.container}>
        
        {/* IZQUIERDA */}
        <View style={styles.leftSection}>
          {loggedUser.username ? (
             <StyledButton
                onPress={isHome ? undefined : handleGoBack}
                variant="secondary"
                style={styles.iconButton}
                disabled={isHome}
             >
                {isHome ? <BookMarked size={24} color={COLORS.text} /> : <ChevronLeft size={24} color={COLORS.text} />}
             </StyledButton>
          ) : (
             <View style={styles.placeholderIcon} />
          )}
        </View>

        {/* CENTRO */}
        <View style={styles.centerSection}>
          <Text style={styles.title} numberOfLines={1}>
            {loggedUser.username ? `${loggedUser.username}_iOrg` : t('appName')} 
          </Text>
        </View>

        {/* DERECHA */}
        <View style={styles.rightSection}>
          {loggedUser.username ? (
            <StyledButton 
              onPress={() => setModalVisible(true)} 
              variant="ghost"
              style={styles.settingsButton} 
            >
               <Settings size={26} color={COLORS.text} />
            </StyledButton>
          ) : (
            <LanguageSwitcher />
          )}
        </View>
      </View>

      {/* --- MODAL AJUSTES (Refactorizado con StyledComponents) --- */}
      <Modal animationType="fade" transparent={true} visible={modalVisible} onRequestClose={handleCloseModal}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalOverlay}>
          <TouchableWithoutFeedback onPress={handleCloseModal}>
            <View style={styles.touchableBackground} />
          </TouchableWithoutFeedback>

          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              {isPasswordMode ? (
                <StyledButton onPress={() => setIsPasswordMode(false)} variant="ghost" style={{padding:0}}>
                   <ArrowLeft size={24} color={COLORS.text} />
                </StyledButton>
              ) : (
                <Text style={styles.modalTitle}>{t('settings')}</Text>
              )}
              <StyledButton onPress={handleCloseModal} variant="ghost" style={styles.closeButton}>
                 <X size={24} color={COLORS.textSecondary} />
              </StyledButton>
            </View>

            <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
              {!isPasswordMode ? (
                <View style={styles.menuContainer}>
                  <View style={styles.cardItem}>
                    <View style={styles.rowLabel}>
                      <Globe size={20} color={COLORS.primary} />
                      <Text style={styles.modalLabel}>{t('language')}</Text>
                    </View>
                    <LanguageSwitcher />
                  </View>

                  <StyledButton 
                    style={styles.menuButton} 
                    onPress={() => setIsPasswordMode(true)}
                    variant="secondary"
                  >
                    <View style={styles.rowLabel}>
                      <Lock size={20} color={COLORS.text} />
                      <Text style={styles.modalButtonText}>{t('changePassword')}</Text>
                    </View>
                    <ChevronLeft size={20} color={COLORS.textSecondary} style={{ transform: [{ rotate: '180deg' }] }} />
                  </StyledButton>

                  <StyledButton
                    style={[styles.menuButton, { borderColor: COLORS.errorLight, backgroundColor: '#FFF5F5' }]} 
                    onPress={() => { handleCloseModal(); logout(); }}
                    variant="ghost"
                  >
                    <View style={styles.rowLabel}>
                      <LogOut size={20} color={COLORS.danger} />
                      <Text style={[styles.modalButtonText, {color: COLORS.danger}]}>{t('logout')}</Text>
                    </View>
                  </StyledButton>
                </View>
              ) : (
                <View style={styles.formContainer}>
                  <Text style={styles.inputLabel}>{t('currentPassword')}</Text>
                  <StyledTextInput secureTextEntry value={oldPassword} onChangeText={(t) => {setOldPassword(t); setServerError('')}} placeholder="******" />

                  <Text style={styles.inputLabel}>{t('newPassword')}</Text>
                  <StyledTextInput secureTextEntry value={newPassword} onChangeText={(t) => {setNewPassword(t); setServerError('')}} placeholder="******" />

                  <Text style={styles.inputLabel}>{t('confirmPassword')}</Text>
                  <StyledTextInput 
                    secureTextEntry 
                    value={confirmPassword} 
                    onChangeText={(t) => {setConfirmPassword(t); setServerError('')}} 
                    placeholder="******" 
                    style={showMismatchError ? { borderColor: COLORS.error } : {}}
                  />
                  
                  {showMismatchError && <Text style={styles.errorText}>{t('passwordsDoNotMatch')}</Text>}
                  {serverError ? <Text style={styles.errorText}>{serverError}</Text> : null}

                  <StyledButton 
                    title={t('save')}
                    onPress={handlePasswordChange}
                    loading={loading}
                    disabled={loading || showMismatchError} 
                    icon={!loading && <Save size={20} color={COLORS.white} />}
                    style={{marginTop: 10}}
                  />
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
  headerContainer: {
    backgroundColor: COLORS.primary,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.secondary,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0,
    elevation: 4,
    zIndex: 100,
  },
  container: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  leftSection: { flex: 1, alignItems: 'flex-start' },
  centerSection: { flex: 2, alignItems: 'center', justifyContent: 'center' },
  rightSection: { flex: 1, alignItems: 'flex-end' },
  
  title: { fontSize: 20, fontWeight: '800', color: COLORS.text },
  iconButton: { width: 44, height: 44, borderRadius: 22, paddingHorizontal: 0, paddingVertical: 0 },
  settingsButton: { width: 44, height: 44, borderRadius: 22, paddingHorizontal: 0, paddingVertical: 0, justifyContent: 'center', alignItems: 'center' },
  placeholderIcon: { width: 44, height: 44 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  touchableBackground: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  modalContent: {
    width: '90%', maxWidth: 450, backgroundColor: COLORS.surface, borderRadius: 24, padding: 24,
    elevation: 10, shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 10
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 22, fontWeight: '800', color: COLORS.text },
  closeButton: { padding: 0, width: 40, height: 40, borderRadius: 20 },
  
  menuContainer: { gap: 12 },
  cardItem: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: COLORS.surface, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: COLORS.borderLight,
  },
  menuButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 16, borderRadius: 12, width: '100%', justifyContent: 'space-between' 
  },
  rowLabel: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  modalLabel: { fontSize: 16, fontWeight: '600', color: COLORS.text },
  modalButtonText: { fontSize: 16, fontWeight: '500', color: COLORS.text },

  formContainer: { gap: 16 },
  inputLabel: { fontSize: 14, fontWeight: '700', color: COLORS.text, marginBottom: -8, marginLeft: 4 },
  errorText: { color: COLORS.error, fontSize: 13, fontWeight: '600', marginLeft: 4 },
});