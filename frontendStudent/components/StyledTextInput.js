import React from 'react';
import { TextInput, StyleSheet } from 'react-native';

export const StyledTextInput = ({ value, onChange, placeholder, ...props }) => {
  return (
    <TextInput
      style={styles.input}
      value={value}
      onChangeText={onChange}
      placeholder={placeholder}
      placeholderTextColor="#94a3b8" // slate-400
      {...props}
    />
  );
};

const styles = StyleSheet.create({
  input: {
    backgroundColor: '#ffffff',     // bg-white
    width: '100%',                  // w-full
    maxWidth: 384,                  // max-w-sm (~24rem)
    padding: 16,                    // p-4
    borderRadius: 12,               // rounded-lg
    borderWidth: 1,                 // border
    borderColor: '#cbd5e1',         // border-slate-300
    fontSize: 18,                   // text-lg
    color: '#000000',               // text-black
  },
});
