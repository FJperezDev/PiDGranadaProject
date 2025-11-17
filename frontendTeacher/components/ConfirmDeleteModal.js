import React from 'react';
import { View, Text, Button, Modal, StyleSheet } from 'react-native';
import { COLORS } from '../constants/colors';

export default function ConfirmDeleteModal({ visible, onClose, onConfirm }) {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>Confirmar Eliminación</Text>
          <Text style={styles.modalText}>
            ¿Estás seguro de que quieres eliminar este grupo? Esta acción no se puede deshacer.
          </Text>
          <View style={styles.buttonRow}>
            <Button title="Cancelar" onPress={onClose} color={COLORS.gray || 'gray'} />
            <Button title="Eliminar" onPress={onConfirm} color={COLORS.danger || 'red'} />
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
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  modalView: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  modalText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 25,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
});