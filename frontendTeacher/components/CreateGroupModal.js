import React, { useState } from 'react';
import { View, Text, TextInput, Modal, StyleSheet, Alert, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { COLORS } from '../constants/colors'; 
import { StyledButton } from './StyledButton';

export default function CreateGroupModal({ visible, subjects, onClose, onSubmit }) {
  const [name, setName] = useState('');
  const [selectedSubject, setSelectedSubject] = useState(subjects[0]?.id);
  
  const handleSubmit = () => {
    if (!name.trim() || !selectedSubject) {
      Alert.alert('Error', 'Por favor, completa todos los campos.');
      return;
    }
    onSubmit(selectedSubject, name);
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
          <Text style={styles.modalTitle}>Crear Nuevo Grupo</Text>
          
          <Text style={styles.label}>Nombre del Grupo</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej: Grupo de Prácticas 1"
            value={name}
            onChangeText={setName}
          />

          <Text style={styles.label}>Asignatura</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedSubject}
              onValueChange={(itemValue) => setSelectedSubject(itemValue)}
              style={styles.picker}
            >
              {subjects.map((subject) => (
                <Picker.Item key={subject.id} label={subject.name} value={subject.id} />
              ))}
            </Picker>
          </View>

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