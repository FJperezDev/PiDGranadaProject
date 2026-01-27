import React, { useState } from 'react';
import { View, Text, Modal, StyleSheet, Alert, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { COLORS } from '../constants/colors';
import { StyledButton } from '../components/StyledButton'; 
import { StyledTextInput } from '../components/StyledTextInput';
import { useLanguage } from '../context/LanguageContext';

const generatePasswordFromEmail = (email) => {
    const parts = email.split('@');
    return parts.length > 0 ? parts[0] : '';
};

export default function InviteUserModal({ visible, onClose, onSubmit }) {
    const { t } = useLanguage();
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('TEACHER'); 
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async () => {
        // ... (Tu lógica original se mantiene igual)
        if (!username.trim() || !email.trim()) {
            Alert.alert(t('error'), t('fillAllFields')); return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            Alert.alert(t('error'), t('emailInvalid')); return;
        }
        
        const password = generatePasswordFromEmail(email.trim());
        try {
            setSubmitting(true);
            await onSubmit({ username: username.trim(), email: email.trim(), password, is_super: role === 'ADMIN' }); 
            setUsername(''); setEmail(''); setRole('TEACHER');
        } catch (error) { } finally { setSubmitting(false); }
    };

    return (
        <Modal animationType="fade" transparent={true} visible={visible} onRequestClose={onClose}>
            <View style={styles.centeredView}>
                <View style={styles.modalView}>
                    <Text style={styles.modalTitle}>{t('createUser')}</Text>
                    
                    <Text style={styles.label}>{t('username')}</Text>
                    <StyledTextInput placeholder="Ej: ana.lopez" value={username} onChangeText={setUsername} autoCapitalize="none" style={{marginBottom: 15}} />

                    <Text style={styles.label}>{t('email')}</Text>
                    <StyledTextInput placeholder="Ej: ana@ugr.es" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" style={{marginBottom: 15}} />
                    
                    <Text style={styles.label}>{t('role')}</Text>
                    <View style={styles.pickerContainer}>
                        <Picker selectedValue={role} onValueChange={setRole} style={styles.picker}>
                            <Picker.Item label={t('teacher')} value="TEACHER" />
                            <Picker.Item label={t('admin')} value="ADMIN" />
                        </Picker>
                    </View>

                    <Text style={styles.infoText}>{t('emailWillBeSent')}</Text>

                    <View style={styles.buttonRow}>
                        <StyledButton title={t('cancel')} onPress={onClose} variant='ghost' style={{flex: 1, marginRight: 10}} />
                        <StyledButton title={t('create')} onPress={handleSubmit} loading={submitting} style={{flex: 1, marginLeft: 10}} />
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    centeredView: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.overlay, padding: 20 },
    modalView: { width: '100%', maxWidth: 400, backgroundColor: COLORS.surface, borderRadius: 20, padding: 24, elevation: 5 },
    modalTitle: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', color: COLORS.text, marginBottom: 20 },
    label: { fontSize: 14, marginBottom: 6, fontWeight: '600', color: COLORS.text, marginLeft: 4 },
    pickerContainer: { borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 12, marginBottom: 20, backgroundColor: COLORS.surface, overflow: 'hidden' },
    picker: { width: '100%', height: 50 },
    infoText: { color: COLORS.textSecondary, fontSize: 13, marginBottom: 20, textAlign: 'center' },
    buttonRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
});