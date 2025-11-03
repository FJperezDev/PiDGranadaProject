module.exports = {
  root: true,
  extends: '@react-native-community',
  rules: {
    // Aquí puedes añadir o sobrescribir reglas.
    // Por ejemplo, si no quieres que te obligue a usar punto y coma:
    'prettier/prettier': 0, // Desactiva reglas de Prettier (si interfiere)
    'semi': ['error', 'never'], // Nunca usar punto y coma
    'react/react-in-jsx-scope': 'off', // No es necesario importar React en cada archivo
    'react-native/no-inline-styles': 'warn', // Advierte sobre estilos en línea
  },
};