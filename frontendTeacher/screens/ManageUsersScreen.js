import React, { useState, useContext, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, RefreshControl, Platform } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext'; 

import { getUsers, createUser, deleteUser } from '../api/inviteRequests'; 

import InviteUserModal from '../components/InviteUserModal';
import { UserPlus, ShieldAlert, Mail, Trash2 } from 'lucide-react-native'; 

import { COLORS } from '../constants/colors';

const getUserDisplayName = (item) => item.username || item.email;

export default function ManageUsersScreen({ navigation }) {
    // CRÍTICO: Aseguramos que 'loggedUser' es el objeto de usuario logueado.
    const { isSuper, loggedUser } = useContext(AuthContext);

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);

    const fetchUsers = async () => {
        if (!isSuper) return;
        try {
            // No establecemos loading=true si es solo refresh
            if (!refreshing) setLoading(true); 
            
            const data = await getUsers();
            setUsers(data);
        } catch (error) {
            // Alert funciona tanto en web como en mobile
            Alert.alert('Error', 'No se pudieron cargar los usuarios.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchUsers();
        }, [isSuper])
    );

    const handleRefresh = () => {
        setRefreshing(true);
        fetchUsers();
    };

    // --- ACCIÓN 1: CREAR/INVITAR USUARIO (Funcionalidad POST) ---
    const handleCreateUser = async (userData) => {
        try {
            await createUser(userData);
            setModalVisible(false);
            // Mostrar la contraseña al éxito para que el admin pueda dársela al profesor.
            Alert.alert('Éxito', `Usuario ${userData.username} creado. Contraseña temporal: ${userData.password}`);
            fetchUsers();
        } catch (error) {
            // Manejo de error específico de la API (DRF)
            let errorMessage = 'No se pudo crear el usuario. Revise los datos.';
            
            if (error.response && error.response.data) {
                const errors = error.response.data;
                // Intentamos parsear cualquier error devuelto por DRF
                for (const key in errors) {
                    if (Array.isArray(errors[key])) {
                         errorMessage = `${key.toUpperCase()}: ${errors[key][0]}`;
                         break; // Solo mostramos el primer error
                    }
                }
            }
            
            Alert.alert('Error', errorMessage);
            throw error; // Re-lanzar para que el modal no se cierre
        }
    };

    // --- ACCIÓN 2: BORRAR USUARIO (Funcionalidad DELETE) ---
    const handleDeleteUser = (item) => {
      if (!item.is_super && item.id === loggedUser.id) { 
          const msg = 'Prohibido: No puedes eliminar tu propia cuenta.';
          if (Platform.OS === 'web') {
              alert(msg);
          } else {
              Alert.alert('Prohibido', msg);
          }
          return;
      }

      const executeDelete = async () => {
          try {
              setLoading(true);
              await deleteUser(item.id);
              
              const successMsg = `Usuario ${getUserDisplayName(item)} eliminado.`;
              
              if (Platform.OS === 'web') {
                  alert('Éxito: ' + successMsg);
              } else {
                  Alert.alert('Éxito', successMsg);
              }

              // Actualizamos la lista localmente
              setUsers(prev => prev.filter(u => u.id !== item.id));
          } catch (error) {
              const errorMsg = 'No se pudo eliminar el usuario.';
              if (Platform.OS === 'web') {
                  alert('Error: ' + errorMsg);
              } else {
                  Alert.alert('Error', errorMsg);
              }
          } finally {
              setLoading(false);
          }
      };

      // 3. Lógica condicional según la plataforma
      const confirmMessage = `¿Estás seguro de que quieres eliminar a ${getUserDisplayName(item)}?`;

      if (Platform.OS === 'web') {
          // --- WEB: Usamos window.confirm ---
          const confirmed = window.confirm(confirmMessage);
          if (confirmed) {
              executeDelete();
          }
      } else {
          // --- MÓVIL: Usamos Alert.alert ---
          Alert.alert(
              'Confirmar Eliminación',
              confirmMessage,
              [
                  {
                      text: 'Cancelar',
                      style: 'cancel',
                  },
                  {
                      text: 'Eliminar',
                      style: 'destructive',
                      onPress: executeDelete, // Llamamos a la función común
                  },
              ]
          );
      }
  };
    // Renderizado de cada usuario en la lista
    const renderUserItem = ({ item }) => (
        <View style={styles.userCard}>
            <View style={styles.userInfo}>
                <Text style={styles.userName}>{getUserDisplayName(item)}</Text>
                <View style={styles.emailRow}>
                    <Mail size={14} color={COLORS.gray || 'gray'} style={{ marginRight: 5 }} />
                    <Text style={styles.userEmail}>{item.email}</Text>
                </View>
            </View>
            
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                {/* Badge de Rol */}
                <View style={[styles.badge, { backgroundColor: getRoleColor(item.is_super) }]}>
                    <Text style={styles.badgeText}>{item.is_super ? 'ADMIN' : 'TEACHER'}</Text>
                </View>

                {!item.is_super && (
                    <TouchableOpacity 
                        onPress={() => handleDeleteUser(item)} 
                        style={styles.deleteButton}
                    >
                        <Trash2 size={20} color={COLORS.danger || 'red'} />
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );

    // Helper para colores de roles (usando item.is_super)
    const getRoleColor = (isSuperUser) => {
        return isSuperUser ? '#FF6B6B' : '#4ECDC4';
    };


    // 1. Verificación de seguridad: Si no es SuperAdmin
    if (!isSuper) {
        return (
            <View style={styles.centerContainer}>
                <ShieldAlert size={64} color={COLORS.danger || 'red'} />
                <Text style={styles.accessDeniedTitle}>Acceso Denegado</Text>
                <Text style={styles.accessDeniedText}>No tienes permisos para gestionar usuarios.</Text>
                <TouchableOpacity 
                    style={styles.goBackButton} 
                    onPress={() => navigation.goBack()}
                >
                    <Text style={styles.goBackButtonText}>Volver</Text>
                </TouchableOpacity>
            </View>
        );
    }

    // 2. Estado de carga
    if (loading && !refreshing) {
        return <ActivityIndicator style={styles.loader} size="large" color={COLORS.primary} />;
    }

    // 3. Interfaz Principal
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.title}>Usuarios</Text>
                    <Text style={styles.subtitle}>Gestiona e invita a nuevos miembros</Text>
                </View>
                <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.addButton}>
                    <UserPlus size={24} color="white" />
                    <Text style={styles.addButtonText}>Invitar</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={users}
                renderItem={renderUserItem}
                keyExtractor={(item) => item.id.toString()}
                style={styles.list}
                contentContainerStyle={{ paddingBottom: 80 }}
                ListEmptyComponent={<Text style={styles.emptyText}>No hay usuarios registrados.</Text>}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
                }
            />

            <InviteUserModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                onSubmit={handleCreateUser}
            />
        </View>
    );
}

// Estilos
const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: COLORS.background || '#f7f9fa',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    loader: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    subtitle: {
        fontSize: 14,
        color: COLORS.gray || 'gray',
        marginTop: 2,
    },
    addButton: {
        backgroundColor: COLORS.secondary || '#007AFF',
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 25,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        ...(Platform.OS === 'web' ? { boxShadow: '0 2px 5px rgba(0,0,0,0.2)' } : { elevation: 4 }),
    },
    addButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 14,
    },
    list: {
        width: '100%',
    },
    userCard: {
        backgroundColor: COLORS.white || 'white',
        padding: 15,
        borderRadius: 12,
        marginBottom: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
         ...(Platform.OS === 'web'
            ? { boxShadow: '0px 1px 3px rgba(0,0,0,0.05)' }
            : {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 2,
                elevation: 2,
            }),
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.text,
        marginBottom: 4,
    },
    emailRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    userEmail: {
        fontSize: 14,
        color: COLORS.gray || 'gray',
    },
    badge: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 12,
        marginLeft: 10,
    },
    badgeText: {
        color: 'white',
        fontSize: 10,
        fontWeight: 'bold',
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 50,
        fontSize: 16,
        color: COLORS.gray || 'gray',
    },
    deleteButton: {
        marginLeft: 15,
        padding: 5,
    },
    accessDeniedTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        marginTop: 20,
        color: COLORS.text,
    },
    accessDeniedText: {
        textAlign: 'center',
        marginTop: 10,
        marginBottom: 30,
        color: COLORS.gray || 'gray',
        fontSize: 16,
    },
    goBackButton: {
        paddingHorizontal: 30,
        paddingVertical: 12,
        backgroundColor: COLORS.primary || 'blue',
        borderRadius: 8,
    },
    goBackButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
});