import React from 'react';
import { View, Text, Modal, StyleSheet, Platform } from 'react-native';
import { COLORS } from '../constants/colors';
import { StyledButton } from './StyledButton';
import { useLanguage } from '../context/LanguageContext';

export default function ConfirmDeleteModal({ visible, onClose, onConfirm, title, message }) {
  const { t } = useLanguage();

  return (
    <Modal animationType="fade" transparent={true} visible={visible} onRequestClose={onClose}>
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>{title || t('delete')}</Text>
          <Text style={styles.modalText}>
            {message || t('deleteGroupConfirm')}
          </Text>
          <View style={styles.buttonRow}>
            <StyledButton 
                title={t('cancel')} 
                onPress={onClose} 
                variant='ghost' 
                style={{ flex: 1, marginRight: 8 }} 
            />
            <StyledButton 
                title={t('delete')} 
                onPress={onConfirm} 
                variant='danger' 
                style={{ flex: 1, marginLeft: 8 }}
            />
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
    padding: 20,
  },
  modalView: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    elevation: 10,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.25, 
    shadowRadius: 8
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 12,
    color: COLORS.text,
    textAlign: 'center'
  },
  modalText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    color: COLORS.textSecondary,
    lineHeight: 24,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
});