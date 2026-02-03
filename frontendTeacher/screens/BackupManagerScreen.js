import React, { useEffect, useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  Alert, 
  ActivityIndicator, 
  StyleSheet, 
  RefreshControl,
  Platform 
} from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
// 1. IMPORTANTE: Importamos la utilidad de memoria, NO SecureStore
import { getAccessToken } from '../utils/memory'; 
import { getBackups, generateBackup, restoreBackup, deleteBackup } from '../api/backupRequests';
import { apiClient, API_BASE_URL } from "../api/api.js"
import { COLORS } from '../constants/colors';
import { useLanguage } from '../context/LanguageContext';
import { StyledButton } from '../components/StyledButton';
import { Download, RotateCcw, Trash2, Plus, FileText, Database } from 'lucide-react-native';

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
    const confirmMsg = t('deleteGroupConfirm'); 
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
    // 2. CORRECCIÓN: Fallback para el nombre del archivo si viene nulo
    const finalFileName = fileName || `backup_${backupId}.xlsx`;
    const downloadPath = `/backups/${backupId}/download/`; 
    const fullUrl = `${API_BASE_URL}${downloadPath}`;
    const mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

    // WEB
    if (Platform.OS === 'web') {
      try {
        setProcessing(true);
        const response = await apiClient.get(downloadPath, { responseType: 'blob' });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', finalFileName);
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
      } catch (e) {
        console.error(e);
        alert(t('downloadError'));
      } finally {
        setProcessing(false);
      }
      return;
    }

    // NATIVE (Android / iOS)
    try {
        setProcessing(true);
        
        // 3. CORRECCIÓN PRINCIPAL: Obtener token de memoria, no de SecureStore
        const token = getAccessToken(); 

        if (!token) throw new Error("No token available (Session expired?)");

        // A. SOLUCIÓN ANDROID (Storage Access Framework)
        if (Platform.OS === 'android') {
            const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
            
            if (permissions.granted) {
                // Descargar a caché temporalmente
                const tempUri = FileSystem.cacheDirectory + finalFileName;
                
                const downloadRes = await FileSystem.downloadAsync(fullUrl, tempUri, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (downloadRes.status !== 200) throw new Error("Error server status: " + downloadRes.status);

                // Leer y guardar en destino final
                const base64 = await FileSystem.readAsStringAsync(tempUri, { encoding: FileSystem.EncodingType.Base64 });
                const createdUri = await FileSystem.StorageAccessFramework.createFileAsync(permissions.directoryUri, finalFileName, mimeType);
                await FileSystem.writeAsStringAsync(createdUri, base64, { encoding: FileSystem.EncodingType.Base64 });

                Alert.alert(t('success'), "Backup guardado correctamente.");
            } else {
                // Usuario canceló la selección de carpeta
                setProcessing(false); 
                return; 
            }
        } 
        
        // B. SOLUCIÓN IOS
        else {
            const fileUri = FileSystem.documentDirectory + finalFileName;
            const downloadRes = await FileSystem.downloadAsync(fullUrl, fileUri, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (downloadRes.status !== 200) throw new Error("Error status: " + downloadRes.status);

            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(downloadRes.uri, {
                    mimeType: mimeType,
                    UTI: 'com.microsoft.excel.xls', 
                    dialogTitle: 'Guardar Backup'
                });
            }
        }

    } catch (e) {
      console.error("Error download native:", e);
      Alert.alert(t('error'), `${t('downloadError')}: ${e.message}`);
    } finally {
        setProcessing(false);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.iconColumn}>
        <View style={styles.fileIconBox}>
            <FileText size={24} color={COLORS.primary} />
        </View>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.fileName} numberOfLines={1} ellipsizeMode="middle">
            {item.file_name}
        </Text>
        <Text style={styles.dateText}>{item.created_at_formatted}</Text>
        
        <View style={styles.metaRow}>
            <View style={[styles.badge, item.is_auto_generated ? styles.badgeAuto : styles.badgeManual]}>
                <Text style={[styles.badgeText, item.is_auto_generated ? {color: COLORS.danger} : {color: COLORS.primaryDark}]}>
                    {item.is_auto_generated ? t('auto') : t('manual')}
                </Text>
            </View>
            <Text style={styles.sizeText}>{item.file_size}</Text>
        </View>
      </View>

      <View style={styles.actionsContainer}>
        <StyledButton 
            onPress={() => downloadFile(item.id, item.file_name)} 
            variant="ghost" 
            size="small" 
            style={styles.actionBtn}
        >
            <Download size={20} color={COLORS.textSecondary} />
        </StyledButton>
        
        <StyledButton 
            onPress={() => handleRestore(item.id)} 
            variant="ghost" 
            size="small" 
            style={[styles.actionBtn, {backgroundColor: '#FFF3E0'}]}
        >
            <RotateCcw size={20} color={COLORS.warning} />
        </StyledButton>

        <StyledButton 
            onPress={() => handleDelete(item.id)} 
            variant="ghost" 
            size="small" 
            style={[styles.actionBtn, {backgroundColor: '#FEE2E2'}]}
        >
            <Trash2 size={20} color={COLORS.danger} />
        </StyledButton>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
            <Text style={styles.headerTitle}>{t('backupManagement')}</Text>
            <Text style={styles.headerSubtitle}>{t('logs')}</Text>
        </View>
        <StyledButton 
            onPress={handleGenerateBackup}
            disabled={processing}
            loading={processing}
            icon={<Plus size={20} color="white" />}
            title={t('create')}
            size="small"
        />
      </View>

      {loading && !refreshing ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={{marginTop: 40}} />
      ) : (
        <FlatList
          data={backups}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
                <Database size={48} color={COLORS.border} />
                <Text style={styles.emptyText}>{t('noBackups')}</Text>
            </View>
          }
        />
      )}
      
      {processing && (
        <View style={styles.overlay}>
            <View style={styles.overlayContent}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.processingText}>{t('processing')}</Text>
            </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: COLORS.background },
  header: { 
      flexDirection: 'row', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      marginBottom: 20,
      marginTop: 10 
  },
  headerTitle: { fontSize: 26, fontWeight: '800', color: COLORS.text },
  headerSubtitle: { fontSize: 14, color: COLORS.textSecondary, marginTop: 2 },
  list: { paddingBottom: 40 },
  card: { 
      backgroundColor: COLORS.surface, 
      padding: 16, 
      borderRadius: 16, 
      marginBottom: 12, 
      flexDirection: 'row', 
      alignItems: 'center', 
      shadowColor: COLORS.shadow, 
      shadowOpacity: 0.05, 
      shadowRadius: 3, 
      elevation: 2,
      borderWidth: 1,
      borderColor: COLORS.borderLight
  },
  iconColumn: { marginRight: 15 },
  fileIconBox: {
      width: 48, height: 48, borderRadius: 12,
      backgroundColor: COLORS.primaryVeryLight,
      justifyContent: 'center', alignItems: 'center'
  },
  infoContainer: { flex: 1, marginRight: 10 },
  fileName: { fontWeight: '700', fontSize: 15, color: COLORS.text, marginBottom: 4 },
  dateText: { color: COLORS.textSecondary, fontSize: 13, marginBottom: 8 },
  metaRow: { flexDirection: 'row', alignItems: 'center' },
  sizeText: { color: COLORS.textSecondary, fontSize: 12, fontWeight: '600' },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginRight: 8 },
  badgeAuto: { backgroundColor: '#FEE2E2' },   
  badgeManual: { backgroundColor: '#E0F2FE' }, 
  badgeText: { fontSize: 10, fontWeight: '800' },
  actionsContainer: { flexDirection: 'row', gap: 8 },
  actionBtn: { width: 36, height: 36, borderRadius: 18, padding: 0, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: { alignItems: 'center', marginTop: 60, opacity: 0.6 },
  emptyText: { textAlign: 'center', color: COLORS.textSecondary, marginTop: 10, fontSize: 16, fontWeight: '500' },
  overlay: { 
      position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, 
      backgroundColor: 'rgba(0,0,0,0.4)', 
      justifyContent: 'center', alignItems: 'center', zIndex: 999 
  },
  overlayContent: {
      backgroundColor: COLORS.surface,
      padding: 24,
      borderRadius: 16,
      alignItems: 'center',
      elevation: 5
  },
  processingText: {
      marginTop: 12,
      color: COLORS.text,
      fontWeight: '600',
      fontSize: 16
  }
});