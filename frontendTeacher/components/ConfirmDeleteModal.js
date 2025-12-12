import React from 'react';
import { View, Text, Modal, StyleSheet, Platform } from 'react-native';
import { COLORS } from '../constants/colors';
import { StyledButton } from './StyledButton';

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
            <StyledButton title="Cancelar" onPress={onClose} variant='ghost' style={{ marginRight: 10 }} />
            <StyledButton title="Eliminar" onPress={onConfirm} variant='danger' />
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
    backgroundColor: COLORS.overlay,
  },
  modalView: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    ...Platform.select({
      ios: { shadowColor: COLORS.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4 },
      android: { elevation: 5 },
      web: { boxShadow: '0px 4px 12px rgba(0,0,0,0.15)' }
    }),
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: COLORS.text,
  },
  modalText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 25,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    width: '100%',
    gap: 10,
  },
});