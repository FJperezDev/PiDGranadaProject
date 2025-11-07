import React from 'react';
import { View, Text, StyleSheet, Modal } from 'react-native';
import { StyledButton } from './StyledButton';

export const AlertModal = ({ visible, onClose, title, message }) => {
  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <View style={styles.modal}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message}>{message}</Text>
        <StyledButton
          title="OK"
          onPress={onClose}
          style={styles.button}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 16,
  },
  modal: {
    backgroundColor: '#fff',
    width: '100%',
    maxWidth: 400, // equivalente a max-w-md
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
    padding: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  message: {
    fontSize: 16,
    marginBottom: 24,
  },
  button: {
    alignSelf: 'flex-end',
    backgroundColor: '#a5f3fc', // cyan-200
  },
});
