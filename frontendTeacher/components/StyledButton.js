import { TouchableOpacity, Text, View, StyleSheet, Platform, ActivityIndicator } from 'react-native';
import { COLORS } from '../constants/colors';

export const StyledButton = ({
  testID,
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  loading,
  style,
  textStyle,
  icon,
  disabled,
  children,
}) => {

  const getBackgroundColor = () => {
    if (disabled) return COLORS.lightGray;
    switch (variant) {
      case 'primary': return COLORS.primary;
      case 'secondary': return COLORS.secondary;
      case 'danger': return COLORS.danger;
      case 'outline': return 'transparent';
      case 'ghost': return 'transparent';
      default: return COLORS.primary;
    }
  };

  const getTextColor = () => {
    if (disabled) return COLORS.textSecondary;
    switch (variant) {
      case 'outline': return COLORS.primary;
      case 'ghost': return COLORS.text;
      case 'secondary': return COLORS.white; 
      default: return COLORS.white;
    }
  };

  const getBorderColor = () => {
    if (variant === 'outline') return COLORS.primary;
    return 'transparent';
  };

  const buttonStyles = [
    styles.buttonBase,
    { backgroundColor: getBackgroundColor() },
    { borderColor: getBorderColor(), borderWidth: variant === 'outline' ? 1.5 : 0 },
    // Tamaños
    size === 'small' && styles.sizeSmall,
    size === 'medium' && styles.sizeMedium,
    size === 'large' && styles.sizeLarge,
    // Sombra solo si no es outline/ghost y no está deshabilitado
    (!['outline', 'ghost'].includes(variant) && !disabled) && styles.shadow,
    style,
  ];

  const labelStyles = [
    styles.text,
    { color: getTextColor() },
    size === 'small' && { fontSize: 14 },
    textStyle,
  ];

  return (
    <TouchableOpacity
      testID={testID}
      style={buttonStyles}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} size="small" />
      ) : (
        <>
          {icon && <View style={styles.iconContainer}>{icon}</View>}
          {children ? children : <Text style={labelStyles}>{title}</Text>}
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  buttonBase: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8, 
  },
  sizeSmall: { paddingVertical: 6, paddingHorizontal: 12 },
  sizeMedium: { paddingVertical: 12, paddingHorizontal: 20 },
  sizeLarge: { paddingVertical: 16, paddingHorizontal: 32, width: '100%' },
  
  shadow: Platform.select({
    ios: { shadowColor: COLORS.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 3 },
    android: { elevation: 3 },
    web: { boxShadow: '0px 2px 4px rgba(0,0,0,0.15)' },
  }),
  
  text: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  iconContainer: {
    marginRight: 8,
  },
});