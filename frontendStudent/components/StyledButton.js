import { TouchableOpacity, Text, View, StyleSheet, ActivityIndicator } from 'react-native';
import { COLORS } from '../constants/colors';

export const StyledButton = ({
  title,
  onPress,
  variant = 'primary', // primary, secondary, outline, ghost, success, danger
  size = 'medium', // small, medium, large
  icon,
  disabled,
  loading,
  style,
  textStyle,
  children,
}) => {
  
  // 1. Configuración de Variantes de Color
  const getVariantStyle = () => {
    switch (variant) {
      case 'secondary':
        return { backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.secondary };
      case 'outline':
        return { backgroundColor: 'transparent', borderWidth: 2, borderColor: COLORS.primary };
      case 'ghost':
        return { backgroundColor: 'transparent', elevation: 0, shadowOpacity: 0 };
      case 'success':
        return { backgroundColor: COLORS.success };
      case 'danger':
        return { backgroundColor: COLORS.error };
      case 'primary':
      default:
        return { backgroundColor: COLORS.primary };
    }
  };

  // 2. Configuración de Texto según Variante
  const getTextStyle = () => {
    switch (variant) {
      case 'outline':
      case 'ghost':
        return { color: COLORS.primary };
      case 'secondary':
        return { color: COLORS.textSecondary };
      case 'success':
      case 'danger':
      case 'primary':
      default:
        return { color: COLORS.text }; // O COLORS.white si prefieres contraste alto
    }
  };

  // 3. Tamaños
  const getSizeStyle = () => {
    switch (size) {
      case 'small': return { paddingVertical: 8, paddingHorizontal: 16 };
      case 'large': return { paddingVertical: 16, paddingHorizontal: 32 };
      default: return { paddingVertical: 12, paddingHorizontal: 24 };
    }
  };

  return (
    <TouchableOpacity
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
        <ActivityIndicator color={variant === 'outline' ? COLORS.primary : COLORS.text} />
      ) : (
        <>
          {icon && <View style={styles.iconContainer}>{icon}</View>}
          {children ? children : (
            <Text style={[styles.text, getTextStyle(), textStyle]}>
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
    borderRadius: 12, // Radio uniforme de 12
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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