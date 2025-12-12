import React, { useState } from 'react';
import { View, Text, TextInput, Modal, StyleSheet, Alert, Platform, ActivityIndicator } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { COLORS } from '../constants/colors';
import { StyledButton } from './StyledButton';

export default function InviteUserModal({ visible, onClose, onSubmit }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('TEACHER');
  const [submitting, setSubmitting] = useState(false);

  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async () => {
    if (!name.trim() || !email.trim()) {
      Alert.alert('Error', 'Por favor completa el nombre y el correo.');
      return;
    }

    if (!isValidEmail(email)) {
      Alert.alert('Error', 'Introduce un correo electrónico válido.');
      return;
    }

    try {
      setSubmitting(true);
      await onSubmit({ name, email, role });
      setName('');
      setEmail('');
      setRole('TEACHER');
    } catch (error) {
    } finally {
      setSubmitting(false);
    }
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
          <Text style={styles.modalTitle}>Invitar Usuario</Text>
          <Text style={styles.subTitle}>Se enviará una contraseña aleatoria por correo.</Text>

          <Text style={styles.label}>Nombre Completo</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej: Ana López"
            value={name}
            onChangeText={setName}
          />

          <Text style={styles.label}>Correo Electrónico</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej: ana@universidad.edu"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.label}>Rol</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={role}
              onValueChange={(itemValue) => setRole(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Profesor" value="TEACHER" />
              <Picker.Item label="Administrador" value="ADMIN" />
            </Picker>
          </View>

          <View style={styles.buttonRow}>
            <StyledButton title="Cancelar" onPress={onClose} variant='danger' />
            {submitting ? (
              <ActivityIndicator color={COLORS.primary} />
            ) : (
              <StyledButton title="Enviar Invitación" onPress={handleSubmit} />
            )}
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
    backgroundColor: COLORS.background,
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
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    color: COLORS.text,
  },
  subTitle: {
    fontSize: 14,
    color: COLORS.gray,
    textAlign: 'center',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    fontWeight: '600',
    color: COLORS.text,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    fontSize: 16,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 5,
    marginBottom: 25,
  },
  picker: {
    width: '100%',
    height: 50,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
});