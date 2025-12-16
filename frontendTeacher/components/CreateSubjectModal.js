import React, { useState } from 'react';
import { View, Text, TextInput, Modal, StyleSheet, Alert, Platform, ScrollView, KeyboardAvoidingView } from 'react-native';
import { COLORS } from '../constants/colors'; 
import { StyledButton } from './StyledButton';
import { useLanguage } from '../context/LanguageContext';

export default function CreateSubjectModal({ visible, onClose, onSubmit }) {
  const { t } = useLanguage();
  const [nameEs, setNameEs] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [descEs, setDescEs] = useState('');
  const [descEn, setDescEn] = useState('');

  const handleSubmit = () => {
    if (!nameEs.trim() || !nameEn.trim()) {
      Alert.alert(t('error'), t('fillAllFields'));
      return;
    }
    onSubmit(nameEs, nameEn, descEs, descEn);
    
    setNameEs('');
    setNameEn('');
    setDescEs('');
    setDescEn('');
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.centeredView}
      >
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>{t('newSubject')}</Text>
          
          <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollContent}>
            
            {/* Sección Español */}
            <Text style={styles.langLabel}>{t('spanishVersion')}</Text>
            <Text style={styles.label}>{t('name')}</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: Matemáticas"
              value={nameEs}
              onChangeText={setNameEs}
              placeholderTextColor={COLORS.gray}
            />
            <Text style={styles.label}>{t('description')}</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="..."
              value={descEs}
              onChangeText={setDescEs}
              multiline={true}
              numberOfLines={3}
              placeholderTextColor={COLORS.gray}
            />

            <View style={styles.divider} />

            {/* Sección Inglés */}
            <Text style={styles.langLabel}>{t('englishVersion')}</Text>
            <Text style={styles.label}>{t('name')}</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Mathematics"
              value={nameEn}
              onChangeText={setNameEn}
              placeholderTextColor={COLORS.gray}
            />
            <Text style={styles.label}>{t('description')}</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="..."
              value={descEn}
              onChangeText={setDescEn}
              multiline={true}
              numberOfLines={3}
              placeholderTextColor={COLORS.gray}
            />

          </ScrollView>

          <View style={styles.buttonRow}>
            <StyledButton title={t('cancel')} onPress={onClose} variant='danger' style={{flex:1, marginRight: 10}} />
            <StyledButton title={t('save')} onPress={handleSubmit} style={{flex:1, marginLeft: 10}} />
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
    maxWidth: 450,
    maxHeight: '85%',
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
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 20,
  },
  scrollContent: {
    marginBottom: 20,
  },
  langLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primaryDark,
    marginBottom: 10,
    marginTop: 5,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
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
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.secondaryLight,
    marginVertical: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.secondaryLight,
  },
});