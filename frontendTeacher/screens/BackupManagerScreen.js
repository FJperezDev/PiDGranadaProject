import React, { useEffect, useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  Alert, 
  ActivityIndicator, 
  StyleSheet, 
  RefreshControl,
  Platform 
} from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { getBackups, generateBackup, restoreBackup, deleteBackup } from '../api/backupRequests';
import { apiClient } from "../api/api.js"
import { COLORS } from '../constants/colors';
import { useLanguage } from '../context/LanguageContext';

export default function BackupManagerScreen() {
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    fetchBackups();
  }, []);

  const fetchBackups = async () => {
    setLoading(true);
    try {
      const data = await getBackups();
      setBackups(data);
    } catch (error) {
      console.error(error);
      if (Platform.OS !== 'web') {
          Alert.alert(t('error'), "No se pudo conectar con el servidor.");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchBackups();
  }, []);

  const handleGenerateBackup = async () => {
    setProcessing(true);
    try {
      await generateBackup();
      if (Platform.OS !== 'web') Alert.alert(t('success'), t('success'));
      fetchBackups(); 
    } catch (error) {
      const msg = error.response?.data?.error || t('error');
      if (Platform.OS !== 'web') Alert.alert(t('error'), msg);
      else alert(msg);
    } finally {
      setProcessing(false);
    }
  };

  const handleDelete = (id) => {
    const confirmMsg = t('deleteGroupConfirm'); // Reutilizamos texto o creamos específico
    if (Platform.OS === 'web') {
        if (confirm(confirmMsg)) {
            performDelete(id);
        }
    } else {
        Alert.alert(
            t('delete'),
            confirmMsg,
            [
                { text: t('cancel'), style: "cancel" },
                { text: t('delete'), style: "destructive", onPress: () => performDelete(id) }
            ]
        );
    }
  };

  const performDelete = async (id) => {
    setProcessing(true);
    try {
      await deleteBackup(id);
      setBackups(prev => prev.filter(b => b.id !== id));
    } catch (error) {
      alert(t('error'));
    } finally {
      setProcessing(false);
    }
  };

  const handleRestore = (id) => {
    const msg = t('restoreConfirm');
    
    if (Platform.OS === 'web') {
        if (confirm(msg)) {
            performRestore(id);
        }
    } else {
        Alert.alert(
            t('restore'),
            msg,
            [
                { text: t('cancel'), style: "cancel" },
                { text: t('restore'), style: "destructive", onPress: () => performRestore(id) }
            ]
        );
    }
  };

  const performRestore = async (id) => {
    setProcessing(true);
    try {
      await restoreBackup(id);
      alert(t('restoreSuccess'));
    } catch (error) {
      const msg = error.response?.data?.error || t('error');
      alert(t('restoreFail') + ": " + msg);
    } finally {
      setProcessing(false);
    }
  };

  const downloadFile = async (backupId, fileName) => {
    // URL del nuevo endpoint
    // NOTA: Usa la URL relativa si tu cliente axios tiene baseURL, si no, pon la completa
    const downloadUrl = `/backups/${backupId}/download/`; 
    // O completa: `https://api.franjpg.com/backups/${backupId}/download/`

    if (Platform.OS === 'web') {
      try {
        setProcessing(true); // Mostrar spinner
        // 1. Petición con Autenticación (Axios maneja el header si está configurado)
        const response = await apiClient.get(downloadUrl, {
            responseType: 'blob', // Importante: recibir binario
        });

        // 2. Crear URL temporal en el navegador
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', fileName || 'backup.xlsx');
        
        // 3. Simular clic y limpiar
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
        window.URL.revokeObjectURL(url);
      } catch (e) {
        console.error(e);
        alert(t('downloadError'));
      } finally {
        setProcessing(false);
      }
      return;
    }

    // --- LÓGICA PARA NATIVE (iOS/Android) ---
    try {
        setProcessing(true);
        const fileUri = FileSystem.documentDirectory + fileName;
        
        // Necesitamos el token manualmente para FileSystem
        // Asumiendo que guardas el token en algún sitio, ej: SecureStore o Context
        // const token = await getToken(); 
        
        // Opción A: Si puedes obtener el token:
        /*
        const downloadRes = await FileSystem.downloadAsync(
            'https://api.franjpg.com' + downloadUrl, // URL completa necesaria aquí
            fileUri,
            {
                headers: {
                    Authorization: `Bearer ${token}` 
                }
            }
        );
        */

        // Opción B (Más sencilla si no quieres lidiar con tokens en FileSystem):
        // Usar Sharing directamente con el blob base64 es complejo.
        // Lo más fácil en Native es que FileSystem descargue.
        // Si la autenticación es compleja, te recomiendo la Opción A.
        
        // *Mock de Opción A asumiendo que tienes el token disponible*:
        // const downloadRes = await FileSystem.downloadAsync(...)

        if (await Sharing.isAvailableAsync()) {
            await Sharing.shareAsync(fileUri); // O downloadRes.uri
        } else {
            Alert.alert(t('success'), "Archivo guardado.");
        }
    } catch (e) {
      console.error(e);
      Alert.alert(t('error'), t('downloadError'));
    } finally {
        setProcessing(false);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.infoContainer}>
        <Text style={styles.fileName} numberOfLines={1} ellipsizeMode="middle">
            {item.file_name}
        </Text>
        <Text style={styles.dateText}>{item.created_at_formatted}</Text>
        
        <View style={styles.metaRow}>
            <View style={[styles.badge, item.is_auto_generated ? styles.badgeAuto : styles.badgeManual]}>
                <Text style={styles.badgeText}>
                    {item.is_auto_generated ? t('auto') : t('manual')}
                </Text>
            </View>
            <Text style={styles.sizeText}>{item.file_size}</Text>
        </View>
      </View>

      <View style={styles.actionsContainer}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => downloadFile(item.id, item.file_name)}>
            <Text style={styles.actionIcon}>📥</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.actionBtn, styles.restoreBtn]} onPress={() => handleRestore(item.id)}>
            <Text style={styles.actionIcon}>🔄</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.actionBtn, styles.deleteBtn]} onPress={() => handleDelete(item.id)}>
            <Text style={styles.actionIcon}>🗑️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{t('backupManagement')}</Text>
      
      <TouchableOpacity 
        style={[styles.mainBtn, processing && styles.disabledBtn]} 
        onPress={handleGenerateBackup}
        disabled={processing}
      >
        {processing ? <ActivityIndicator color="#fff"/> : <Text style={styles.mainBtnText}>+ {t('generateBackup')}</Text>}
      </TouchableOpacity>

      {loading && !refreshing ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={{marginTop: 20}} />
      ) : (
        <FlatList
          data={backups}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <Text style={styles.emptyText}>{t('noBackups')}</Text>
          }
        />
      )}
      
      {processing && (
        <View style={styles.overlay}>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={{color: '#fff', marginTop: 10}}>{t('processing')}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 50, backgroundColor: COLORS.background },
  header: { fontSize: 28, fontWeight: '800', marginBottom: 25, color: COLORS.text },
  mainBtn: { backgroundColor: COLORS.primary, padding: 16, borderRadius: 14, alignItems: 'center', marginBottom: 20 },
  mainBtnText: { color: COLORS.white, fontWeight: '700', fontSize: 17 },
  disabledBtn: { opacity: 0.6 },
  list: { paddingBottom: 40 },
  emptyText: { textAlign: 'center', color: COLORS.textSecondary, marginTop: 20 },
  card: { backgroundColor: COLORS.surface, padding: 16, borderRadius: 16, marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', shadowColor: COLORS.shadow, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2 },
  infoContainer: { flex: 1, marginRight: 10 },
  fileName: { fontWeight: '600', fontSize: 15, color: COLORS.text, marginBottom: 4 },
  dateText: { color: COLORS.textSecondary, fontSize: 13, marginBottom: 8 },
  metaRow: { flexDirection: 'row', alignItems: 'center' },
  sizeText: { color: COLORS.textSecondary, fontSize: 12, fontWeight: '500' },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, marginRight: 8 },
  badgeAuto: { backgroundColor: COLORS.successBg },   
  badgeManual: { backgroundColor: COLORS.primaryLight }, 
  badgeText: { fontSize: 10, fontWeight: '700', color: COLORS.text },
  actionsContainer: { flexDirection: 'row', gap: 8 },
  actionBtn: { backgroundColor: COLORS.background, width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  restoreBtn: { backgroundColor: '#FFF3E0' }, 
  deleteBtn: { backgroundColor: COLORS.dangerBg }, 
  actionIcon: { fontSize: 18 },
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: COLORS.overlay, justifyContent: 'center', alignItems: 'center', zIndex: 999 }
});