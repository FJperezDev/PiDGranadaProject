import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { COLORS } from '../constants/colors';

export const StyledButton = ({
  title,
  onPress,
  className = '',
  style,
  textStyle,
  icon,
  disabled,
  children,
}) => {
  // Combina los estilos de StyleSheet con los de className
  const buttonStyles = [
    styles.buttonBase,
    disabled ? styles.disabled : styles.active,
    style, // Permite pasar estilos personalizados desde fuera
  ];

  return (
    <TouchableOpacity
      style={buttonStyles}
      className={className} // className puede sobreescribir o añadir estilos
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8} // Controla la opacidad al presionar
    >
      {icon && <View className="mr-2">{icon}</View>}

      {children ? (
        children
      ) : (
        <Text style={[styles.text, textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  buttonBase: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary, // Color principal por defecto
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 999, // rounded-full
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  disabled: {
    opacity: 0.5,
  },
  // active:bg-cyan-200 no se puede aplicar directamente aquí,
  // pero activeOpacity da un buen feedback.
  // Si usas una librería como `twrnc`, podrías aplicar estilos condicionales.
});