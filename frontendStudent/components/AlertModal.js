import React from 'react';
import { View, Text, StyleSheet, Modal, Platform } from 'react-native';
import { StyledButton } from './StyledButton';
import { COLORS } from '../constants/colors';

export const AlertModal = ({ visible, onClose, title, message }) => {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          <StyledButton
            title="OK"
            onPress={onClose}
            style={styles.button}
            textStyle={styles.buttonText}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.overlay,
    padding: 20, // Padding para evitar bordes en móviles pequeños
  },
  modal: {
    backgroundColor: COLORS.surface,
    width: '100%',
    maxWidth: 400, // Responsivo: Máximo ancho en tablet/web
    borderRadius: 16,
    padding: 24,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
      },
      android: { elevation: 8 },
      web: { boxShadow: '0px 10px 25px rgba(0,0,0,0.1)' }
    }),
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 12,
  },
  message: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: 24,
    lineHeight: 22,
  },
  button: {
    alignSelf: 'flex-end',
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  buttonText: {
    color: COLORS.text, // Asegura contraste
  }
});