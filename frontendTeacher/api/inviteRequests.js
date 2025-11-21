import { Alert } from 'react-native';

// Simula la URL base
const API_URL = 'https://tu-backend-api.com'; 

export const getUsers = async () => {
  // Aquí harías el fetch a tu backend
  // const response = await fetch(`${API_URL}/users`);
  // return await response.json();
  
  // Mock de datos para visualización
  return [
    { id: 1, name: 'Juan Pérez', email: 'juan@test.com', role: 'TEACHER' },
    { id: 2, name: 'Maria Garcia', email: 'maria@test.com', role: 'STUDENT' },
  ];
};

export const inviteUser = async (userData) => {
  // userData espera: { name, email, role }
  try {
    // const response = await fetch(`${API_URL}/users/invite`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(userData)
    // });
    // if (!response.ok) throw new Error('Error en invitación');
    // return await response.json();

    console.log("Enviando invitación a:", userData);
    return true; // Simula éxito
  } catch (error) {
    throw error;
  }
};