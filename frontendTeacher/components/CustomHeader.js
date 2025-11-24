import React, { useState, useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Modal, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { BookMarked, ChevronLeft, Settings, LogOut, Globe, Lock, X, Save, ArrowLeft } from 'lucide-react-native';
import { COLORS } from '../constants/colors';
import { AuthContext } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { LanguageSwitcher } from './LanguageSwitcher';
import { changePassword } from '../api/authRequests'; 

export const CustomHeader = ({ routeName }) => {
  const { loggedUser, logout } = useContext(AuthContext);
  const { t } = useLanguage();
  const navigation = useNavigation();
  
  // Estados UI
  const [modalVisible, setModalVisible] = useState(false);
  const [isPasswordMode, setIsPasswordMode] = useState(false); // Alternar entre menú y formulario
  const [loading, setLoading] = useState(false);

  // Estados Formulario Password
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // Lógica de Header (Home vs Back)
  const isHome = routeName === 'Home';
  const handleGoBack = () => {
    if (navigation.canGoBack()) navigation.goBack();
    else navigation.navigate('Home');
  };

  // Resetear estados al cerrar modal
  const handleCloseModal = () => {
    setModalVisible(false);
    setIsPasswordMode(false);
    setOldPassword('');
    setNewPassword('');
    setLoading(false);
  };

  // Lógica para cambiar contraseña
  const handlePasswordChange = async () => {
    if (!oldPassword || !newPassword) {
      Alert.alert('Error', t('fillAllFields') || 'Por favor rellena todos los campos');
      return;
    }

    setLoading(true);
    // Llamada a tu API
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
      {/* --- SECCIÓN IZQUIERDA --- */}
      <View style={styles.leftSection}>
        {loggedUser.username ? (
          isHome ? (
            <View style={styles.iconButton}>
              <BookMarked size={28} color={COLORS.black} />
            </View>
          ) : (
            <TouchableOpacity onPress={handleGoBack} activeOpacity={0.7} style={styles.iconButton}>
              <ChevronLeft size={28} color={COLORS.black} />
            </TouchableOpacity>
          )
        ) : (
          <View style={styles.iconButton}>
             <BookMarked size={28} color={COLORS.black} />
          </View>
        )}
      </View>

      {/* --- SECCIÓN CENTRAL --- */}
      <View style={styles.centerSection}>
        <Text style={styles.title}>
          {loggedUser.username ? `${loggedUser.username}_iOrg` : t('appName')}
        </Text>
      </View>

      {/* --- SECCIÓN DERECHA --- */}
      <View style={styles.rightSection}>
        {loggedUser.username ? (
          <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.settingsButton}>
            <Settings size={26} color={COLORS.black} />
          </TouchableOpacity>
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
            
            {/* CABECERA DEL MODAL */}
            <View style={styles.modalHeader}>
              {isPasswordMode ? (
                <TouchableOpacity onPress={() => setIsPasswordMode(false)} style={{flexDirection:'row', alignItems:'center'}}>
                   <ArrowLeft size={24} color={COLORS.text} />
                   <Text style={{marginLeft: 5, fontSize:16, color: COLORS.text}}>{t('back') || 'Volver'}</Text>
                </TouchableOpacity>
              ) : (
                <Text style={styles.modalTitle}>{t('settings') || 'Ajustes'}</Text>
              )}
              
              <TouchableOpacity onPress={handleCloseModal}>
                <X size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            {/* CONTENIDO DEL MODAL */}
            {!isPasswordMode ? (
              // VISTA 1: MENÚ PRINCIPAL
              <>
                {/* Idioma */}
                <View style={styles.modalItem}>
                  <View style={styles.modalItemHeader}>
                    <Globe size={20} color={COLORS.primary} style={{marginRight: 10}} />
                    <Text style={styles.modalLabel}>{t('language') || 'Idioma'}</Text>
                  </View>
                  <LanguageSwitcher /> 
                </View>

                {/* Botón Ir a Cambiar Contraseña */}
                <TouchableOpacity 
                  style={styles.modalButton} 
                  onPress={() => setIsPasswordMode(true)}
                >
                  <Lock size={20} color={COLORS.text} />
                  <Text style={styles.modalButtonText}>{t('changePassword') || 'Cambiar Contraseña'}</Text>
                </TouchableOpacity>

                <View style={styles.divider} />

                {/* Cerrar Sesión */}
                <TouchableOpacity 
                  style={[styles.modalButton, styles.logoutButton]} 
                  onPress={() => {
                    handleCloseModal();
                    logout();
                  }}
                >
                  <LogOut size={20} color={COLORS.danger || 'red'} />
                  <Text style={[styles.modalButtonText, {color: COLORS.danger || 'red'}]}>
                    {t('logout') || 'Cerrar Sesión'}
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              // VISTA 2: FORMULARIO CAMBIO CONTRASEÑA
              <View style={styles.formContainer}>
                <Text style={styles.inputLabel}>{t('currentPassword') || 'Contraseña Actual'}</Text>
                <TextInput 
                  style={styles.input}
                  secureTextEntry
                  value={oldPassword}
                  onChangeText={setOldPassword}
                  placeholder="******"
                />

                <Text style={styles.inputLabel}>{t('newPassword') || 'Nueva Contraseña'}</Text>
                <TextInput 
                  style={styles.input}
                  secureTextEntry
                  value={newPassword}
                  onChangeText={setNewPassword}
                  placeholder="******"
                />

                <TouchableOpacity 
                  style={[styles.saveButton, loading && {opacity: 0.7}]} 
                  onPress={handlePasswordChange}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <>
                      <Save size={20} color="white" />
                      <Text style={styles.saveButtonText}>{t('save') || 'Guardar'}</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            )}

          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  // ... Estilos previos del header ...
  container: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.primary,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.secondary,
    ...(Platform.OS === 'web' ? { boxShadow: '0px 1px 2px rgba(0,0,0,0.05)' } : { elevation: 2 }),
  },
  leftSection: { flex: 1, alignItems: 'flex-start' },
  centerSection: { flex: 2, alignItems: 'center', justifyContent: 'center' },
  rightSection: { flex: 1, alignItems: 'flex-end', flexDirection: 'row', justifyContent: 'flex-end' },
  title: { fontSize: 20, fontWeight: 'bold', color: COLORS.text },
  iconButton: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.secondary,
    borderWidth: 1,
    borderRadius: 999,
    padding: 6,
    elevation: 2,
  },
  settingsButton: { padding: 8 },

  // --- ESTILOS DEL MODAL ---
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    width: '85%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 25,
    alignItems: 'stretch',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    height: 30, // Altura fija para evitar saltos al cambiar título
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  modalItem: { marginBottom: 20 },
  modalItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  modalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  modalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    marginBottom: 10,
  },
  modalButtonText: {
    marginLeft: 10,
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
  },
  logoutButton: {
    backgroundColor: '#ffebee',
    marginTop: 10,
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 10,
  },

  // --- ESTILOS DEL FORMULARIO ---
  formContainer: {
    marginTop: 10,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 5,
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    backgroundColor: '#fafafa',
  },
  saveButton: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    padding: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  }
});