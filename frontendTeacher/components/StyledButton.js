import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet, Platform, ActivityIndicator } from 'react-native';
import { COLORS } from '../constants/colors';

export const StyledButton = ({
  testID,
  title,
  onPress,
  variant = 'primary', // primary, secondary, danger, ghost, outline, success
  size = 'medium', // small, medium, large
  loading,
  style,
  textStyle,
  icon,
  disabled,
  children,
}) => {

  const getVariantStyle = () => {
    switch (variant) {
      case 'secondary':
        return { backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.secondary };
      case 'outline':
        return { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: COLORS.primary };
      case 'ghost':
        return { backgroundColor: 'transparent', elevation: 0, shadowOpacity: 0 };
      case 'danger':
        return { backgroundColor: COLORS.error };
      case 'success':
        return { backgroundColor: COLORS.success };
      case 'primary':
      default:
        return { backgroundColor: COLORS.primary };
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case 'outline':
      case 'ghost':
        return { color: COLORS.primary };
      case 'secondary':
        return { color: COLORS.textSecondary }; // Gris oscuro para contraste
      case 'danger':
      case 'success':
      case 'primary':
      default:
        return { color: COLORS.white };
    }
  };

  const getSizeStyle = () => {
    switch (size) {
      case 'small': return { paddingVertical: 8, paddingHorizontal: 12 };
      case 'large': return { paddingVertical: 16, paddingHorizontal: 32, width: '100%' };
      default: return { paddingVertical: 12, paddingHorizontal: 20 };
    }
  };

  return (
    <TouchableOpacity
      testID={testID}
      style={[
        styles.base,
        getVariantStyle(),
        getSizeStyle(),
        disabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' || variant === 'ghost' ? COLORS.primary : COLORS.white} />
      ) : (
        <>
          {icon && <View style={styles.iconContainer}>{icon}</View>}
          {children ? children : (
            <Text style={[styles.text, getTextStyle(), size === 'small' && { fontSize: 14 }, textStyle]}>
              {title}
            </Text>
          )}
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12, // Unificado con Inputs
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  iconContainer: {
    marginRight: 8,
  },
  disabled: {
    opacity: 0.5,
  },
});