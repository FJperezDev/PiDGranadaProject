import React, { useState } from 'react';
import { View, Text, TextInput, Modal, StyleSheet, Alert, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { COLORS } from '../constants/colors'; 
import { StyledButton } from './StyledButton';

export default function CreateSubjectModal({ visible, subjects, onClose, onSubmit }) {
  const [name, setName] = useState('');


  const handleSubmit = () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Por favor, completa todos los campos.');
      return;
    }
    onSubmit(name);
    setName('');
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>Crear Nueva Asignatura</Text>

          <Text style={styles.label}>Nombre de la Asignatura</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej: Matemáticas"
            value={name}
            onChangeText={setName}
          />

          <View style={styles.buttonRow}>
            <StyledButton title="Cancelar" onPress={onClose} variant='danger' />
            <StyledButton title="Confirmar" onPress={handleSubmit} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundColor,
  },
  modalView: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    padding: 20,
    alignItems: 'stretch',
    ...Platform.select({
      ios: { shadowColor: COLORS.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4 },
      android: { elevation: 5 },
      web: { boxShadow: '0px 4px 12px rgba(0,0,0,0.15)' }
    }),
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: COLORS.text,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.borderColor,
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    fontSize: 16,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: COLORS.borderColor,
    borderRadius: 5,
    marginBottom: 20,
  },
  picker: {
    width: '100%',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
});
