import React, { useState } from 'react';
import { View, Text, StyleSheet, Button, Alert, TouchableOpacity, Share, Platform, Clipboard } from 'react-native';
import { deleteGroup } from '../api/coursesRequests'; 
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import { COLORS } from '../constants/colors';
import { useLanguage } from '../context/LanguageContext';
import { Copy, Trash2, BarChart } from 'lucide-react-native';

export default function GroupDetailScreen({ route, navigation }) {
  const { group } = route.params;
  const [modalVisible, setModalVisible] = useState(false);
  const { t } = useLanguage();
  
  const accessCode = group.groupCode; 

  const handleDelete = async () => {
    try {
      await deleteGroup(group.subject.id, group.id);
      setModalVisible(false);
      Alert.alert(t('success'), t('success'));
      navigation.goBack();
    } catch (error) {
      Alert.alert(t('error'), t('error'));
      setModalVisible(false);
    }
  };

  const copyToClipboard = () => {
    Clipboard.setString(accessCode);
    Alert.alert(t('success'), t('codeCopied'));
  };
  
  const shareCode = () => {
    Share.share({
      message: `${t('accessCode')}: ${accessCode}`,
      title: t('accessCode')
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{group.name_es}</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t('accessCode')}</Text>
        <Text style={styles.accessCode}>{accessCode || 'N/A'}</Text>
        <TouchableOpacity style={styles.copyButton} onPress={copyToClipboard}>
          <Copy size={20} color={COLORS.primary} />
          <Text style={styles.copyButtonText}>{t('copyCode')}</Text>
        </TouchableOpacity>
        <Button title={t('shareCode')} onPress={shareCode} color={COLORS.primary} />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t('teachingManagement')}</Text>
        
        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={() => navigation.navigate('Analytics', { initialGroupBy: 'group' })}
        >
          <BarChart size={22} color={COLORS.text} />
          <Text style={styles.actionButtonText}>{t('viewStats')}</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.actionButton, styles.deleteButton]} 
          onPress={() => setModalVisible(true)}
        >
          <Trash2 size={22} color={COLORS.danger} />
          <Text style={[styles.actionButtonText, styles.deleteButtonText]}>
            {t('deleteGroup')}
          </Text>
        </TouchableOpacity>
      </View>

      <ConfirmDeleteModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onConfirm={handleDelete}
        title={t('deleteGroup')}
        message={t('deleteGroupConfirm')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: COLORS.background,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 20,
    color: COLORS.text,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    ...(Platform.OS === 'web'
      ? { boxShadow: '0px 1px 3px rgba(0,0,0,0.1)' }
      : {
          shadowColor: COLORS.shadow,
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 3,
          elevation: 3,
        }),
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    color: COLORS.primaryDark,
  },
  accessCode: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    color: COLORS.text,
    letterSpacing: 2,
    marginBottom: 10,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    borderRadius: 5,
    backgroundColor: COLORS.primaryLight,
    alignSelf: 'center',
    marginBottom: 15,
  },
  copyButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: '500',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.secondary,
    marginBottom: 10,
  },
  actionButtonText: {
    fontSize: 16,
    marginLeft: 15,
    fontWeight: '500',
    color: COLORS.text,
  },
  deleteButton: {
    borderColor: COLORS.danger,
  },
  deleteButtonText: {
    color: COLORS.danger,
  },
});