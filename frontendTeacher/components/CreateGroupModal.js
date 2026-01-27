import React, { useState, useEffect } from 'react';
import { View, Text, Modal, StyleSheet, Alert, Platform, KeyboardAvoidingView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { COLORS } from '../constants/colors'; 
import { StyledButton } from './StyledButton';
import { StyledTextInput } from './StyledTextInput';
import { useLanguage } from '../context/LanguageContext';

export default function CreateGroupModal({ visible, subjects, onClose, onSubmit }) {
  const { t } = useLanguage();
  const [nameEs, setNameEs] = useState('');
  const [nameEn, setNameEn] = useState('');
  
  // Estado inicial seguro
  const [selectedSubject, setSelectedSubject] = useState(null);
  
  // EFECTO MÁGICO: Cuando se abre el modal, si no hay selección, selecciona el primero
  useEffect(() => {
    if (visible && subjects.length > 0) {
        // Solo forzamos si no hay uno ya seleccionado o si el seleccionado no existe
        if (!selectedSubject || !subjects.find(s => s.id === selectedSubject)) {
            setSelectedSubject(subjects[0].id);
        }
    }
  }, [visible, subjects]);

  const handleSubmit = () => {
    // 1. Validación de campos de texto
    if (!nameEs.trim() || !nameEn.trim()) {
      Alert.alert(t('error'), t('fillAllFields'));
      return;
    }
    
    // 2. Validación crítica de asignatura
    if (!selectedSubject) {
      Alert.alert(t('error'), t('noSubjects') || "Selecciona una asignatura válida");
      return;
    }

    onSubmit(selectedSubject, nameEs, nameEn);
    
    // Limpiamos nombres pero MANTENEMOS la asignatura seleccionada por comodidad
    setNameEs('');
    setNameEn('');
  };

  return (
    <Modal animationType="fade" transparent={true} visible={visible} onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>{t('newGroup')}</Text>
          
          <Text style={styles.label}>{t('subject')}</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedSubject}
              onValueChange={(itemValue) => setSelectedSubject(itemValue)}
              style={styles.picker}
              // Deshabilitamos si no hay asignaturas
              enabled={subjects.length > 0}
            >
              {subjects.length === 0 ? (
                  <Picker.Item label={"No hay asignaturas"} value={null} />
              ) : (
                  subjects.map((subject) => (
                    <Picker.Item 
                        key={subject.id} 
                        label={subject.name_es || subject.name} 
                        value={subject.id} 
                        color={COLORS.text}
                    />
                  ))
              )}
            </Picker>
          </View>

          <Text style={styles.label}>{t('name')} (Español)</Text>
          <StyledTextInput 
            placeholder="Ej: Grupo A - Mañana" 
            value={nameEs} 
            onChangeText={setNameEs} 
            style={{marginBottom: 16}} 
          />

          <Text style={styles.label}>{t('name')} (English)</Text>
          <StyledTextInput 
            placeholder="Ex: Group A - Morning" 
            value={nameEn} 
            onChangeText={setNameEn} 
            style={{marginBottom: 24}} 
          />

          <View style={styles.buttonRow}>
            <StyledButton 
                title={t('cancel')} 
                onPress={onClose} 
                variant='ghost' 
                style={{flex: 1, marginRight: 10}} 
            />
            <StyledButton 
                title={t('create')} 
                onPress={handleSubmit} 
                style={{flex: 1, marginLeft: 10}}
                // Deshabilitamos visualmente si no hay subject
                disabled={!selectedSubject}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  centeredView: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.overlay, padding: 20 },
  modalView: { width: '100%', maxWidth: 450, backgroundColor: COLORS.surface, borderRadius: 20, padding: 24, elevation: 5 },
  modalTitle: { fontSize: 22, fontWeight: '800', marginBottom: 20, textAlign: 'center', color: COLORS.text },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 6, color: COLORS.textSecondary, marginLeft: 4 },
  pickerContainer: { borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 12, marginBottom: 16, backgroundColor: COLORS.surface, overflow: 'hidden' },
  picker: { width: '100%', height: 50 },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
});