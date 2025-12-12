import React from 'react';
import { TextInput, StyleSheet, Platform } from 'react-native';
import { COLORS } from '../constants/colors';

export const StyledTextInput = ({ value, onChange, placeholder, style, ...props }) => {
  return (
    <TextInput
      style={[styles.input, style]}
      value={value}
      onChangeText={onChange}
      placeholder={placeholder}
      placeholderTextColor={COLORS.textLight}
      {...props}
    />
  );
};

const styles = StyleSheet.create({
  input: {
    backgroundColor: COLORS.surface,
    width: '100%',
    maxWidth: 400, // Limite para web/tablet
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    fontSize: 16,
    color: COLORS.text,
    ...Platform.select({
       web: { outlineStyle: 'none' } // Quita el borde azul feo en web
    })
  },
});