import React from 'react';
import { TextInput, StyleSheet, Platform, View } from 'react-native';
import { COLORS } from '../constants/colors';

export const StyledTextInput = ({ style, ...props }) => {
  return (
    <TextInput
      style={[styles.input, style]}
      placeholderTextColor={COLORS.textLight}
      {...props}
    />
  );
};

const styles = StyleSheet.create({
  input: {
    backgroundColor: COLORS.surface, // Fondo blanco
    width: '100%',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12, // Coherente con los botones
    borderWidth: 1.5,
    borderColor: COLORS.border, // Gris suave
    fontSize: 16,
    color: COLORS.text,
    ...Platform.select({
       web: { outlineStyle: 'none' } 
    })
  },
});