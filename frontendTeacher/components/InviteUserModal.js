import React, { useState } from 'react';
import { View, Text, TextInput, Modal, StyleSheet, Alert, Platform, ActivityIndicator } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { COLORS } from '../constants/colors';
import { StyledButton } from '../components/StyledButton'; 
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

    const isValidEmail = (email) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const handleSubmit = async () => {
        if (!username.trim() || !email.trim()) {
            Alert.alert(t('error'), t('fillAllFields'));
            return;
        }

        if (!isValidEmail(email)) {
            Alert.alert(t('error'), t('emailInvalid'));
            return;
        }

        const password = generatePasswordFromEmail(email.trim());

        if (password.length === 0) {
             Alert.alert(t('error'), t('passwordGenError'));
            return;
        }

        const userData = {
            username: username.trim(),
            email: email.trim(),
            password: password, 
            is_super: role === 'ADMIN', 
        };

        try {
            setSubmitting(true);
            await onSubmit(userData); 
            setUsername('');
            setEmail('');
            setRole('TEACHER');
        } catch (error) {
            // El error se maneja en el padre
        } finally {
            setSubmitting(false);
        }
    };

    const handleClose = () => {
        setUsername('');
        setEmail('');
        setRole('TEACHER');
        onClose();
    };

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={handleClose}
        >
            <View style={styles.centeredView}>
                <View style={styles.modalView}>
                    <Text style={styles.modalTitle}>{t('createUser')}</Text>
                    
                    <Text style={styles.label}>{t('username')}</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Ej: ana.lopez"
                        value={username}
                        onChangeText={setUsername}
                        autoCapitalize="none"
                    />

                    <Text style={styles.label}>{t('email')}</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Ej: ana@ugr.es"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                    
                    {email.trim().length > 0 && isValidEmail(email.trim()) && (
                         <Text style={styles.passwordHint}>
                             {t('tempPasswordHint')} **{generatePasswordFromEmail(email)}**
                         </Text>
                    )}

                    <Text style={styles.label}>{t('role')}</Text>
                    <View style={styles.pickerContainer}>
                        <Picker
                            selectedValue={role}
                            onValueChange={(itemValue) => setRole(itemValue)}
                            style={styles.picker}
                        >
                            <Picker.Item label={t('teacher')} value="TEACHER" />
                            <Picker.Item label={t('admin')} value="ADMIN" />
                        </Picker>
                    </View>

                    <View style={styles.buttonRow}>
                        <StyledButton title={t('cancel')} onPress={handleClose} variant='danger' style={{flex: 1, marginRight: 10}} />
                        <StyledButton 
                            title={t('create')} 
                            onPress={handleSubmit} 
                            loading={submitting}
                            style={{flex: 1, marginLeft: 10}}
                        />
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.background,
    },
    modalView: {
        width: '90%',
        maxWidth: 400,
        backgroundColor: COLORS.surface,
        borderRadius: 10,
        padding: 20,
        alignItems: 'stretch',
        ...Platform.select({
            ios: { shadowColor: COLORS.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4 },
            android: { elevation: 5 },
            web: { boxShadow: '0px 4px 12px rgba(0,0,0,0.15)' }
        }),
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        textAlign: 'center',
        color: COLORS.text,
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        marginBottom: 5,
        fontWeight: '600',
        color: COLORS.text,
    },
    input: {
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 5,
        padding: 10,
        marginBottom: 15,
        fontSize: 16,
    },
    passwordHint: {
        fontSize: 14,
        color: COLORS.success,
        marginBottom: 15,
        textAlign: 'center',
    },
    pickerContainer: {
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 5,
        marginBottom: 25,
    },
    picker: {
        width: '100%',
        height: 50,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
        alignItems: 'center',
    },
});