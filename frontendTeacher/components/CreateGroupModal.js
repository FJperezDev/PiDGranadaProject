import React, { useState } from 'react';
import { View, Text, TextInput, Modal, StyleSheet, Alert, Platform, KeyboardAvoidingView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { COLORS } from '../constants/colors'; 
import { StyledButton } from './StyledButton';
import { useLanguage } from '../context/LanguageContext';

export default function CreateGroupModal({ visible, subjects, onClose, onSubmit }) {
  const { t } = useLanguage();
  const [nameEs, setNameEs] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [selectedSubject, setSelectedSubject] = useState(subjects[0]?.id);
  
  const handleSubmit = () => {
    if (!nameEs.trim() || !nameEn.trim() || !selectedSubject) {
      Alert.alert(t('error'), t('fillAllFields'));
      return;
    }
    // Enviamos: ID Asignatura, Nombre ES, Nombre EN
    onSubmit(selectedSubject, nameEs, nameEn);
    
    // Resetear
    setNameEs('');
    setNameEn('');
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.centeredView}
      >
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>{t('newGroup')}</Text>
          
          <Text style={styles.label}>{t('subject')}</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedSubject}
              onValueChange={(itemValue) => setSelectedSubject(itemValue)}
              style={styles.picker}
            >
              {subjects.map((subject) => (
                <Picker.Item 
                    key={subject.id} 
                    label={subject.name_es || subject.name} 
                    value={subject.id} 
                    color={COLORS.text}
                />
              ))}
            </Picker>
          </View>

          <Text style={styles.label}>{t('name')} (Español)</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej: Grupo A - Mañana"
            value={nameEs}
            onChangeText={setNameEs}
            placeholderTextColor={COLORS.gray}
          />

          <Text style={styles.label}>{t('name')} (English)</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: Group A - Morning"
            value={nameEn}
            onChangeText={setNameEn}
            placeholderTextColor={COLORS.gray}
          />

          <View style={styles.buttonRow}>
            <StyledButton title={t('cancel')} onPress={onClose} variant='danger' style={{flex: 1, marginRight: 10}} />
            <StyledButton title={t('create')} onPress={handleSubmit} style={{flex: 1, marginLeft: 10}} />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 24,
    ...Platform.select({
      ios: { shadowColor: COLORS.shadow, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
      android: { elevation: 8 },
      web: { boxShadow: '0px 10px 25px rgba(0,0,0,0.2)' }
    }),
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 24,
    textAlign: 'center',
    color: COLORS.text,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
    color: COLORS.textSecondary,
  },
  input: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.secondaryLight,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    color: COLORS.text,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: COLORS.secondaryLight,
    borderRadius: 8,
    marginBottom: 20,
    backgroundColor: COLORS.background,
    overflow: 'hidden', 
  },
  picker: {
    width: '100%',
    height: Platform.OS === 'ios' ? 150 : 50,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
});