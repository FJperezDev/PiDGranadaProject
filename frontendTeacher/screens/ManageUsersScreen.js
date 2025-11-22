import React, { useState, useContext, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, RefreshControl, Platform } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext'; 
import { getUsers, inviteUser } from '../api/inviteRequests'; // Importamos las nuevas funciones
import InviteUserModal from '../components/InviteUserModal';
import { UserPlus, ShieldAlert, Mail } from 'lucide-react-native'; // Iconos sugeridos
import { COLORS } from '../constants/colors';

export default function ManageUsersScreen({ navigation }) {
  const { isSuper } = useContext(AuthContext);

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  // Cargar lista de usuarios existentes
  const fetchUsers = async () => {
    if (!isSuper) return; // Seguridad extra
    try {
      setLoading(true);
      const data = await getUsers();
      setUsers(data);
    } catch (error) {
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

  const handleInviteUser = async (userData) => {
    try {
      await inviteUser(userData);
      setModalVisible(false);
      Alert.alert('Éxito', `Invitación enviada a ${userData.email}`);
      fetchUsers(); // Recargar la lista
    } catch (error) {
      Alert.alert('Error', 'No se pudo enviar la invitación. Inténtelo de nuevo.');
      throw error; // Re-lanzar para que el modal sepa que falló
    }
  };

  // Renderizado de cada usuario en la lista
  const renderUserItem = ({ item }) => (
    <View style={styles.userCard}>
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.name}</Text>
        <View style={styles.emailRow}>
          <Mail size={14} color={COLORS.gray || 'gray'} style={{ marginRight: 5 }} />
          <Text style={styles.userEmail}>{item.email}</Text>
        </View>
      </View>
      <View style={[styles.badge, { backgroundColor: getRoleColor(item.role) }]}>
         <Text style={styles.badgeText}>{item.role}</Text>
      </View>
    </View>
  );

  // Helper para colores de roles
  const getRoleColor = (role) => {
    switch (role) {
      case 'ADMIN': return '#FF6B6B'; // Rojo suave
      case 'TEACHER': return '#4ECDC4'; // Turquesa
    }
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
        onSubmit={handleInviteUser}
      />
    </View>
  );
}

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
  // Estilos de Acceso Denegado
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