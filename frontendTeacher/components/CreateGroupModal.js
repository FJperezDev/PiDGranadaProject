import React, { useState, useEffect } from 'react';
import { View, Text, Modal, StyleSheet, Platform, KeyboardAvoidingView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { COLORS } from '../constants/colors'; 
import { StyledButton } from './StyledButton';
import { StyledTextInput } from './StyledTextInput';
import { useLanguage } from '../context/LanguageContext';

export default function CreateGroupModal({ visible, subjects, onClose, onSubmit }) {
  const { t } = useLanguage();
  const [nameEs, setNameEs] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [warning, setWarning] = useState("");

  useEffect(() => {
    if (visible && subjects.length > 0) {
        if (!selectedSubject || !subjects.find(s => s.id === selectedSubject)) {
            setSelectedSubject(subjects[0].id);
        }
    }
    // Limpiar warning al abrir
    if (visible) setWarning("");
  }, [visible, subjects]);

  const showWarning = (msg) => {
      setWarning(msg);
      setTimeout(() => setWarning(""), 3000);
  };

  const handleSubmit = () => {
    // 1. Validación de campos de texto
    if (!nameEs.trim()) {
      showWarning(t('fillAllFields') || 'El nombre (ES) es obligatorio');
      return;
    }
    // Opcional: Validar inglés
    // if (!nameEn.trim()) { showWarning('Name (EN) is mandatory'); return; }
    
    // 2. Validación crítica de asignatura
    if (!selectedSubject) {
      showWarning(t('noSubjects') || "Selecciona una asignatura válida");
      return;
    }

    onSubmit(selectedSubject, nameEs, nameEn);
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
            placeholder="Ej: Grupo A - Mañana *" 
            value={nameEs} 
            onChangeText={setNameEs} 
            style={{marginBottom: 16}} 
          />

          <Text style={styles.label}>{t('name')} (English)</Text>
          <StyledTextInput 
            placeholder="Ex: Group A - Morning *" 
            value={nameEn} 
            onChangeText={setNameEn} 
            style={{marginBottom: 24}} 
          />

          {/* WARNING TEXT */}
          {warning ? <Text style={styles.warningText}>{warning}</Text> : null}

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
  
  warningText: {
    color: COLORS.error,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 15,
  },

  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 5 },
});