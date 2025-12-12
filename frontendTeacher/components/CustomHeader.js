import React, { useState, useContext, useEffect } from 'react';
import { View, Text, StyleSheet, Platform, Modal, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { BookMarked, ChevronLeft, Settings, LogOut, Globe, Lock, X, Save, ArrowLeft } from 'lucide-react-native';
import { COLORS } from '../constants/colors';
import { AuthContext } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { LanguageSwitcher } from './LanguageSwitcher';
import { changePassword } from '../api/authRequests'; 
import { StyledButton } from './StyledButton';

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
    setLoading(false);
  };

  const handlePasswordChange = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', t('fillAllFields') || 'Por favor rellena todos los campos');
      return;
    }

    if (!passwordsMatch) {
      Alert.alert('Error', t('passwordsDoNotMatch') || 'Las contraseñas no coinciden');
      return;
    }

    setLoading(true);
    const result = await changePassword(oldPassword, newPassword);
    setLoading(false);

    if (result) {
      Alert.alert('Éxito', t('passwordChanged') || 'Contraseña actualizada correctamente');
      handleCloseModal();
    } else {
      Alert.alert('Error', t('passwordChangeError') || 'No se pudo cambiar la contraseña. Verifica tu contraseña actual.');
    }
  };

  return (
    <View style={styles.container}>
      {/* ... (SECCIONES IZQUIERDA, CENTRAL Y DERECHA SIN CAMBIOS) ... */}
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

      <View style={styles.centerSection}>
        <Text style={styles.title}>
          {loggedUser.username ? `${loggedUser.username}_iOrg` : t('appName')}
        </Text>
      </View>

      <View style={styles.rightSection}>
        {loggedUser.username ? (
          
          <StyledButton 
            onPress={() => setModalVisible(true)} 
            style={styles.settingsButton} 
            icon={<Settings size={26} color={COLORS.black} />
          }/>

        ) : (
          <LanguageSwitcher />
        )}
      </View>

      {/* --- MODAL DE AJUSTES --- */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={handleCloseModal}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            
            <View style={styles.modalHeader}>
              {isPasswordMode ? (
                <StyledButton 
                  onPress={() => setIsPasswordMode(false)} 
                  icon={<ArrowLeft size={24} color={COLORS.text} />} 
                  style={{flexDirection:'row', alignItems:'center'}}
                >
                   <Text style={{marginLeft: 5, fontSize:16, color: COLORS.text}}>{t('back') || 'Volver'}</Text>
                </StyledButton>
              ) : (
                <Text style={styles.modalTitle}>{t('settings') || 'Ajustes'}</Text>
              )}
              <StyledButton 
                onPress={handleCloseModal}
                icon={<X size={24} color={COLORS.text} />}
              />

            {!isPasswordMode ? (
              <>
                <View style={styles.modalItem}>
                  <View style={styles.modalItemHeader}>
                    <Globe size={20} color={COLORS.primary} style={{marginRight: 10}} />
                    <Text style={styles.modalLabel}>{t('language') || 'Idioma'}</Text>
                  </View>
                  <LanguageSwitcher /> 
                </View>

                <StyledButton 
                  style={styles.modalButton} 
                  onPress={() => setIsPasswordMode(true)}
                  icon={<Lock size={20} color={COLORS.text} />}
                >
                  <Text style={styles.modalButtonText}>{t('changePassword') || 'Cambiar Contraseña'}</Text>
                </StyledButton>

                <View style={styles.divider} />

                <StyledButton
                  style={[styles.modalButton, styles.logoutButton]} 
                  onPress={() => { handleCloseModal(); logout(); }}
                  // Cierra la llave } aquí mismo:
                  icon={<LogOut size={20} color={COLORS.danger} />} 
                >
                  <Text style={[styles.modalButtonText, {color: COLORS.danger}]}>
                    {t('logout') || 'Cerrar Sesión'}
                  </Text>
                </StyledButton>
              </>
            ) : (
              <View style={styles.formContainer}>
                {/* 1. Contraseña Actual */}
                <Text style={styles.inputLabel}>{t('currentPassword') || 'Contraseña Actual'}</Text>
                <TextInput 
                  style={styles.input}
                  secureTextEntry
                  value={oldPassword}
                  onChangeText={setOldPassword}
                  placeholder="******"
                />

                {/* 2. Nueva Contraseña */}
                <Text style={styles.inputLabel}>{t('newPassword') || 'Nueva Contraseña'}</Text>
                <TextInput 
                  style={styles.input}
                  secureTextEntry
                  value={newPassword}
                  onChangeText={setNewPassword}
                  placeholder="******"
                />

                {/* 3. Confirmar Contraseña (NUEVO) */}
                <Text style={styles.inputLabel}>{t('confirmPassword') || 'Confirmar Nueva Contraseña'}</Text>
                <TextInput 
                  style={[styles.input, showMismatchError && styles.inputError]} 
                  secureTextEntry
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="******"
                />

                {/* Mensaje de Error en Rojo */}
                {showMismatchError && (
                  <Text style={styles.errorText}>
                    {t('passwordsDoNotMatch') || 'Las contraseñas no coinciden'}
                  </Text>
                )}

                <StyledButton 
                  style={[
                    styles.saveButton, 
                    (loading || showMismatchError) && {opacity: 0.5, backgroundColor: COLORS.lightGray}
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
            </View>
          </View>
        </View>
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

  leftSection: { 
    flex: 1, 
    alignItems: 'flex-start' 
  },

  centerSection: { 
    flex: 2, 
    alignItems: 'center', 
    justifyContent: 'center' 
  },

  rightSection: { 
    flex: 1, 
    alignItems: 'flex-end', 
    flexDirection: 'row', 
    justifyContent: 'flex-end' 
  },

  title: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    color: COLORS.text 
  },

  iconButton: { 
    backgroundColor: COLORS.white, 
    borderColor: COLORS.secondary, 
    borderWidth: 1, 
    borderRadius: 8, 
    padding: 6, 
    elevation: 2 
  },
  
  settingsButton: { padding: 8 },

  centeredView: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: COLORS.background
  },

  modalView: { 
    width: '85%', 
    backgroundColor: COLORS.surface, 
    borderRadius: 20, 
    padding: 25, 
    alignItems: 'stretch', 
    ...Platform.select({
      ios: { shadowColor: COLORS.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4 },
      android: { elevation: 5 },
      web: { boxShadow: '0px 4px 12px rgba(0,0,0,0.15)' }
    }),
    elevation: 5 
  },

  modalHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    marginBottom: 20, 
    height: 30 
  },

  modalTitle: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    color: COLORS.text 
  },

  modalItem: { 
    marginBottom: 20 
  },

  modalItemHeader: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 10 
  },

  modalLabel: { 
    fontSize: 16, 
    fontWeight: '600', 
    color: COLORS.text 
  },

  modalButton: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingVertical: 12, 
    paddingHorizontal: 10, 
    borderRadius: 8, 
    backgroundColor: COLORS.background, 
    marginBottom: 10 
  },

  modalButtonText: { 
    marginLeft: 10, 
    fontSize: 16, 
    fontWeight: '500', 
    color: COLORS.text 
  },

  logoutButton: { 
    backgroundColor: COLORS.background, 
    marginTop: 10 
  },

  divider: { 
    height: 1, 
    backgroundColor: COLORS.background, 
    marginVertical: 10 
  },

  formContainer: { marginTop: 10 },
  
  inputLabel: { 
    fontSize: 14, 
    fontWeight: '600', 
    color: COLORS.text, 
    marginBottom: 5, 
    marginTop: 10 
  },
  
  input: { 
    borderWidth: 1, 
    borderColor: COLORS.border, 
    borderRadius: 8, 
    padding: 10, 
    fontSize: 16, 
    backgroundColor: COLORS.input, 
  },
  
  inputError: { borderColor: COLORS.danger, borderWidth: 1 },
  
  errorText: {
    color: COLORS.danger || 'red',
    fontSize: 13,
    marginTop: 5,
    fontWeight: '500',
    marginLeft: 2,
  },

  saveButton: { 
    flexDirection: 'row',
    backgroundColor: COLORS.primary, 
    padding: 12, 
    borderRadius: 8, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginTop: 20 
  },

  saveButtonText: { 
    color: COLORS.surface, 
    fontSize: 16, 
    fontWeight: 'bold', 
    marginLeft: 8 }
});