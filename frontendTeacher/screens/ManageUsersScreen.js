import React, { useState, useContext, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, RefreshControl, Platform } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext'; 
import { getUsers, createUser, deleteUser } from '../api/inviteRequests'; 
import InviteUserModal from '../components/InviteUserModal';
import { UserPlus, ShieldAlert, Mail, Trash2 } from 'lucide-react-native'; 
import { COLORS } from '../constants/colors';
import { useLanguage } from '../context/LanguageContext';

const getUserDisplayName = (item) => item.username || item.email;

export default function ManageUsersScreen({ navigation }) {
    const { isSuper, loggedUser } = useContext(AuthContext);
    const { t } = useLanguage();

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);

    const fetchUsers = async () => {
        if (!isSuper) return;
        try {
            if (!refreshing) setLoading(true); 
            const data = await getUsers();
            setUsers(data);
        } catch (error) {
            Alert.alert(t('error'), t('error'));
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

    const handleCreateUser = async (userData) => {
        try {
            await createUser(userData);
            setModalVisible(false);
            Alert.alert(t('success'), `${t('userCreated')} ${userData.password}`);
            fetchUsers();
        } catch (error) {
            let errorMessage = t('error');
            if (error.response && error.response.data) {
                const errors = error.response.data;
                for (const key in errors) {
                    if (Array.isArray(errors[key])) {
                         errorMessage = `${key.toUpperCase()}: ${errors[key][0]}`;
                         break; 
                    }
                }
            }
            Alert.alert(t('error'), errorMessage);
            throw error; 
        }
    };

    const handleDeleteUser = (item) => {
      if (!item.is_super && item.id === loggedUser.id) { 
          const msg = t('accessDenied');
          if (Platform.OS === 'web') alert(msg);
          else Alert.alert(t('error'), msg);
          return;
      }

      const executeDelete = async () => {
          try {
              setLoading(true);
              await deleteUser(item.id);
              const successMsg = t('success');
              if (Platform.OS === 'web') alert(successMsg);
              else Alert.alert(t('success'), successMsg);
              setUsers(prev => prev.filter(u => u.id !== item.id));
          } catch (error) {
              const errorMsg = t('error');
              if (Platform.OS === 'web') alert(errorMsg);
              else Alert.alert(t('error'), errorMsg);
          } finally {
              setLoading(false);
          }
      };

      const confirmMessage = `${t('deleteUserConfirm')} ${getUserDisplayName(item)}?`;

      if (Platform.OS === 'web') {
          if (window.confirm(confirmMessage)) executeDelete();
      } else {
          Alert.alert(
              t('confirm'),
              confirmMessage,
              [
                  { text: t('cancel'), style: 'cancel' },
                  { text: t('delete'), style: 'destructive', onPress: executeDelete },
              ]
          );
      }
    };

    const renderUserItem = ({ item }) => (
        <View style={styles.userCard}>
            <View style={styles.userInfo}>
                <Text style={styles.userName}>{getUserDisplayName(item)}</Text>
                <View style={styles.emailRow}>
                    <Mail size={14} color={COLORS.textSecondary} style={{ marginRight: 5 }} />
                    <Text style={styles.userEmail}>{item.email}</Text>
                </View>
            </View>
            
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={[styles.badge, { backgroundColor: getRoleColor(item.is_super) }]}>
                    <Text style={styles.badgeText}>{item.is_super ? t('admin') : t('teacher')}</Text>
                </View>

                {!item.is_super && (
                    <TouchableOpacity 
                        onPress={() => handleDeleteUser(item)} 
                        style={styles.deleteButton}
                    >
                        <Trash2 size={20} color={COLORS.danger} />
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );

    const getRoleColor = (isSuperUser) => {
        return isSuperUser ? COLORS.danger : COLORS.success;
    };

    if (!isSuper) {
        return (
            <View style={styles.centerContainer}>
                <ShieldAlert size={64} color={COLORS.danger} />
                <Text style={styles.accessDeniedTitle}>{t('accessDenied')}</Text>
                <Text style={styles.accessDeniedText}>{t('noPerms')}</Text>
                <TouchableOpacity 
                    style={styles.goBackButton} 
                    onPress={() => navigation.goBack()}
                >
                    <Text style={styles.goBackButtonText}>{t('back')}</Text>
                </TouchableOpacity>
            </View>
        );
    }

    if (loading && !refreshing) {
        return <ActivityIndicator style={styles.loader} size="large" color={COLORS.primary} />;
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.title}>{t('users')}</Text>
                    <Text style={styles.subtitle}>{t('manageInvite')}</Text>
                </View>
                <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.addButton}>
                    <UserPlus size={24} color="white" />
                    <Text style={styles.addButtonText}>{t('invite')}</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={users}
                renderItem={renderUserItem}
                keyExtractor={(item) => item.id.toString()}
                style={styles.list}
                contentContainerStyle={{ paddingBottom: 80 }}
                ListEmptyComponent={<Text style={styles.emptyText}>{t('noResults')}</Text>}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
            />

            <InviteUserModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                onSubmit={handleCreateUser}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: COLORS.background },
    centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    title: { fontSize: 28, fontWeight: 'bold', color: COLORS.text },
    subtitle: { fontSize: 14, color: COLORS.textSecondary, marginTop: 2 },
    addButton: {
        backgroundColor: COLORS.secondary,
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 25,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        ...(Platform.OS === 'web' ? { boxShadow: '0 2px 5px rgba(0,0,0,0.2)' } : { elevation: 4 }),
    },
    addButtonText: { color: 'white', fontWeight: 'bold', fontSize: 14 },
    list: { width: '100%' },
    userCard: {
        backgroundColor: COLORS.surface,
        padding: 15,
        borderRadius: 12,
        marginBottom: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
         ...(Platform.OS === 'web'
            ? { boxShadow: '0px 1px 3px rgba(0,0,0,0.05)' }
            : { shadowColor: COLORS.shadow, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 }),
    },
    userInfo: { flex: 1 },
    userName: { fontSize: 16, fontWeight: '700', color: COLORS.text, marginBottom: 4 },
    emailRow: { flexDirection: 'row', alignItems: 'center' },
    userEmail: { fontSize: 14, color: COLORS.textSecondary },
    badge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12, marginLeft: 10 },
    badgeText: { color: 'white', fontSize: 10, fontWeight: 'bold' },
    emptyText: { textAlign: 'center', marginTop: 50, fontSize: 16, color: COLORS.textSecondary },
    deleteButton: { marginLeft: 15, padding: 5 },
    accessDeniedTitle: { fontSize: 22, fontWeight: 'bold', marginTop: 20, color: COLORS.text },
    accessDeniedText: { textAlign: 'center', marginTop: 10, marginBottom: 30, color: COLORS.textSecondary, fontSize: 16 },
    goBackButton: { paddingHorizontal: 30, paddingVertical: 12, backgroundColor: COLORS.primary, borderRadius: 8 },
    goBackButtonText: { color: 'white', fontWeight: 'bold' },
});