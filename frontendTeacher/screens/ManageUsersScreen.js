import React, { useState, useContext, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Alert, RefreshControl, Platform } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext'; 
import { getUsers, createUser, deleteUser } from '../api/inviteRequests'; 
import InviteUserModal from '../components/InviteUserModal';
import { UserPlus, ShieldAlert, Mail, Trash2, Shield, User } from 'lucide-react-native'; 
import { COLORS } from '../constants/colors';
import { useLanguage } from '../context/LanguageContext';
import { StyledButton } from '../components/StyledButton';

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

    useFocusEffect(useCallback(() => { fetchUsers(); }, [isSuper]));

    const handleRefresh = () => { setRefreshing(true); fetchUsers(); };

    const handleCreateUser = async (userData) => {
        try {
            const response = await createUser(userData);
            setModalVisible(false);
            const successTitle = t('success');
            const successMsg = `${t('userCreated')} ${t('emailSentTo')} ${userData.email}`;
            if (Platform.OS === 'web') window.alert(`${successTitle}: ${successMsg}`);
            else Alert.alert(successTitle, successMsg);
            fetchUsers();
        } catch (error) {
            let errorMessage = t('error');
            if (error.response?.data?.detail) errorMessage = error.response.data.detail;
            Alert.alert(t('error'), errorMessage);
        }
    };

    const handleDeleteUser = (item) => {
      if (!item.is_super && item.id === loggedUser.id) return Alert.alert(t('error'), t('accessDenied'));
      const executeDelete = async () => {
          try {
              setLoading(true);
              await deleteUser(item.id);
              setUsers(prev => prev.filter(u => u.id !== item.id));
          } catch (error) { Alert.alert(t('error'), t('error')); } finally { setLoading(false); }
      };
      const msg = `${t('deleteUserConfirm')} ${getUserDisplayName(item)}?`;
      if (Platform.OS === 'web') { if (window.confirm(msg)) executeDelete(); }
      else { Alert.alert(t('confirm'), msg, [{ text: t('cancel'), style: 'cancel' }, { text: t('delete'), style: 'destructive', onPress: executeDelete }]); }
    };

    const renderUserItem = ({ item }) => {
        const isAdmin = item.is_super;
        return (
            <View style={styles.userCard}>
                <View style={[styles.avatar, isAdmin ? {backgroundColor: COLORS.dangerBg} : {backgroundColor: COLORS.successBg}]}>
                    {isAdmin ? <Shield size={24} color={COLORS.danger} /> : <User size={24} color={COLORS.success} />}
                </View>
                
                <View style={styles.userInfo}>
                    <Text style={styles.userName}>{getUserDisplayName(item)}</Text>
                    <View style={styles.emailRow}>
                        <Mail size={14} color={COLORS.textSecondary} style={{ marginRight: 6 }} />
                        <Text style={styles.userEmail}>{item.email}</Text>
                    </View>
                </View>
                
                <View style={{alignItems: 'flex-end'}}>
                    <View style={[styles.badge, { backgroundColor: isAdmin ? COLORS.danger : COLORS.success }]}>
                        <Text style={styles.badgeText}>{isAdmin ? t('admin') : t('teacher')}</Text>
                    </View>
                    {!isAdmin && (
                        <StyledButton 
                            onPress={() => handleDeleteUser(item)} 
                            variant="ghost" 
                            size="small"
                            style={styles.deleteButton}
                        >
                            {/* AUMENTADO: Icono más grande (22) */}
                            <Trash2 size={22} color={COLORS.danger} />
                        </StyledButton>
                    )}
                </View>
            </View>
        );
    };

    if (!isSuper) {
        return (
            <View style={styles.centerContainer}>
                <ShieldAlert size={64} color={COLORS.danger} />
                <Text style={styles.accessDeniedTitle}>{t('accessDenied')}</Text>
                <Text style={styles.accessDeniedText}>{t('noPerms')}</Text>
                <StyledButton title={t('back')} onPress={() => navigation.goBack()} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.title}>{t('users')}</Text>
                    <Text style={styles.subtitle}>{t('manageInvite')}</Text>
                </View>
                <StyledButton 
                    onPress={() => setModalVisible(true)} 
                    icon={<UserPlus size={20} color="white" />}
                    title={t('invite')}
                    size="small"
                />
            </View>

            {loading && !refreshing ? <ActivityIndicator size="large" color={COLORS.primary} /> : (
                <FlatList
                    data={users}
                    renderItem={renderUserItem}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={{ paddingBottom: 80, gap: 12 }}
                    ListEmptyComponent={<Text style={styles.emptyText}>{t('noResults')}</Text>}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
                />
            )}

            <InviteUserModal visible={modalVisible} onClose={() => setModalVisible(false)} onSubmit={handleCreateUser} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: COLORS.background },
    centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    title: { fontSize: 28, fontWeight: 'bold', color: COLORS.text },
    subtitle: { fontSize: 14, color: COLORS.textSecondary, marginTop: 2 },
    
    userCard: {
        backgroundColor: COLORS.surface,
        padding: 16,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.borderLight,
        elevation: 2,
        shadowColor: COLORS.shadow, shadowOffset: {width:0, height:2}, shadowOpacity:0.05, shadowRadius:3
    },
    avatar: {
        width: 48, height: 48, borderRadius: 24,
        justifyContent: 'center', alignItems: 'center',
        marginRight: 16
    },
    userInfo: { flex: 1 },
    userName: { fontSize: 16, fontWeight: '700', color: COLORS.text, marginBottom: 4 },
    emailRow: { flexDirection: 'row', alignItems: 'center' },
    userEmail: { fontSize: 14, color: COLORS.textSecondary },
    
    badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, marginBottom: 4 },
    badgeText: { color: 'white', fontSize: 10, fontWeight: 'bold' },
    
    // Ajustado para icono más grande
    deleteButton: { 
        paddingHorizontal: 8, 
        paddingVertical: 8,
        marginTop: 4 
    },
    
    emptyText: { textAlign: 'center', marginTop: 50, fontSize: 16, color: COLORS.textSecondary },
    accessDeniedTitle: { fontSize: 22, fontWeight: 'bold', marginTop: 20, color: COLORS.text },
    accessDeniedText: { textAlign: 'center', marginTop: 10, marginBottom: 30, color: COLORS.textSecondary, fontSize: 16 },
});