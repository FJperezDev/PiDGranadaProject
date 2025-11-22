import { TouchableOpacity, Text, View, StyleSheet, Platform } from 'react-native';
import { COLORS } from '../constants/colors';

export const StyledButton = ({
  title,
  onPress,
  className = '',
  style,
  icon,
  disabled,
  children,
}) => {
  const buttonStyles = [
    styles.buttonBase,
    disabled ? styles.disabled : styles.active,
    style,
  ];

  return (
    <TouchableOpacity
      style={buttonStyles}
      className={className}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8} 
    >
      {icon && <View className="mr-2">{icon}</View>}

      {children ? (
        children
      ) : (
        <Text style={styles.text}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  buttonBase: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 999,
    ...(Platform.OS === 'web'
      ? { boxShadow: '0px 2px 4px rgba(0,0,0,0.1)' }
      : {
          shadowColor: COLORS.black,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        }),
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  disabled: {
    opacity: 0.5,
  },
});