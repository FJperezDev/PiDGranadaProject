import React, { useState } from 'react';
import { View, Text, Modal, StyleSheet, Alert, Platform, ScrollView, KeyboardAvoidingView } from 'react-native';
import { COLORS } from '../constants/colors'; 
import { StyledButton } from './StyledButton';
import { StyledTextInput } from './StyledTextInput';
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
    setNameEs(''); setNameEn(''); setDescEs(''); setDescEn('');
  };

  return (
    <Modal animationType="fade" transparent={true} visible={visible} onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>{t('newSubject')}</Text>
          
          <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollContent}>
            <Text style={styles.langLabel}>{t('spanishVersion')}</Text>
            <StyledTextInput placeholder="Ej: Matemáticas" value={nameEs} onChangeText={setNameEs} style={{marginBottom: 10}} />
            <StyledTextInput placeholder="Descripción..." value={descEs} onChangeText={setDescEs} multiline numberOfLines={3} style={[styles.textArea, {marginBottom: 20}]} />

            <View style={styles.divider} />

            <Text style={styles.langLabel}>{t('englishVersion')}</Text>
            <StyledTextInput placeholder="Ex: Mathematics" value={nameEn} onChangeText={setNameEn} style={{marginBottom: 10}} />
            <StyledTextInput placeholder="Description..." value={descEn} onChangeText={setDescEn} multiline numberOfLines={3} style={styles.textArea} />
          </ScrollView>

          <View style={styles.buttonRow}>
            <StyledButton title={t('cancel')} onPress={onClose} variant='ghost' style={{flex:1, marginRight: 10}} />
            <StyledButton title={t('save')} onPress={handleSubmit} style={{flex:1, marginLeft: 10}} />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  centeredView: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.overlay, padding: 20 },
  modalView: { width: '100%', maxWidth: 450, maxHeight: '90%', backgroundColor: COLORS.surface, borderRadius: 20, padding: 24, elevation: 5 },
  modalTitle: { fontSize: 22, fontWeight: '800', color: COLORS.text, textAlign: 'center', marginBottom: 20 },
  scrollContent: { marginBottom: 20 },
  langLabel: { fontSize: 14, fontWeight: '700', color: COLORS.primary, marginBottom: 8, marginTop: 5, textTransform: 'uppercase' },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  divider: { height: 1, backgroundColor: COLORS.borderLight, marginVertical: 15 },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 10 },
});