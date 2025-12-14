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
  Platform // <--- Importante para detectar si es Web o Móvil
} from 'react-native';

// Solo importamos FileSystem y Sharing si NO es web, o lo manejamos con cuidado
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

import { getBackups, generateBackup, restoreBackup, deleteBackup } from '../api/backupRequests';

export default function BackupManagerScreen() {
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

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
      // En web, Alert a veces es molesto, pero funciona. 
      // Si falla la conexión, revisa que el backend permita CORS.
      if (Platform.OS !== 'web') {
          Alert.alert("Error", "No se pudo conectar con el servidor.");
      } else {
          console.log("Error de conexión:", error);
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

  // --- ACCIONES ---

  const handleGenerateBackup = async () => {
    setProcessing(true);
    try {
      await generateBackup();
      if (Platform.OS !== 'web') Alert.alert("Éxito", "Copia generada.");
      fetchBackups(); 
    } catch (error) {
      const msg = error.response?.data?.error || "Falló la generación.";
      if (Platform.OS !== 'web') Alert.alert("Error", msg);
      else alert(msg); // Fallback para web
    } finally {
      setProcessing(false);
    }
  };

  const handleDelete = (id) => {
    if (Platform.OS === 'web') {
        // Confirmación nativa del navegador para Web
        if (confirm("¿Estás seguro de eliminar esta copia?")) {
            performDelete(id);
        }
    } else {
        // Alerta nativa para Móvil
        Alert.alert(
            "Eliminar copia",
            "¿Estás seguro? Esta acción no se puede deshacer.",
            [
                { text: "Cancelar", style: "cancel" },
                { text: "Eliminar", style: "destructive", onPress: () => performDelete(id) }
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
      alert("No se pudo eliminar");
    } finally {
      setProcessing(false);
    }
  };

  const handleRestore = (id) => {
    const msg = "⚠️ ESTO BORRARÁ TODOS LOS DATOS ACTUALES y restaurará la copia seleccionada.";
    
    if (Platform.OS === 'web') {
        if (confirm(msg + "\n¿Continuar?")) {
            performRestore(id);
        }
    } else {
        Alert.alert(
            "Restaurar Base de Datos",
            msg,
            [
                { text: "Cancelar", style: "cancel" },
                { text: "RESTAURAR", style: "destructive", onPress: () => performRestore(id) }
            ]
        );
    }
  };

  const performRestore = async (id) => {
    setProcessing(true);
    try {
      await restoreBackup(id);
      alert("✅ Restauración completada con éxito.");
    } catch (error) {
      console.log("🔥 ERROR DEL SERVER:", JSON.stringify(error.response?.data, null, 2)); 
      
      const msg = error.response?.data?.error || "Error desconocido";
      alert("Falló la restauración: " + msg);
    } finally {
      setProcessing(false);
    }
  };

  // --- LÓGICA DE DESCARGA HÍBRIDA (WEB vs MÓVIL) ---
  const downloadFile = async (fileUrl, fileName) => {
    if (!fileUrl) return;

    // 1. LÓGICA PARA WEB (Navegador)
    if (Platform.OS === 'web') {
        try {
            // Creamos un link invisible y le hacemos click
            const link = document.createElement('a');
            link.href = fileUrl;
            link.download = fileName || 'backup.xlsx';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (e) {
            console.error("Error descarga web:", e);
            alert("Error al descargar en el navegador.");
        }
        return;
    }

    // 2. LÓGICA PARA MÓVIL (Android / iOS)
    try {
      const fileUri = FileSystem.documentDirectory + fileName;
      
      // Nota: Si usas Expo SDK 54+, 'downloadAsync' está deprecado.
      // Si te da error en MÓVIL, cambia esta línea por la nueva API de FileSystem
      // pero por ahora mantenemos la compatibilidad si no has migrado completamente.
      const downloadRes = await FileSystem.downloadAsync(fileUrl, fileUri);

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(downloadRes.uri);
      } else {
        Alert.alert("Descargado", "Archivo guardado en la carpeta de la app.");
      }
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "No se pudo descargar en el dispositivo.");
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
                    {item.is_auto_generated ? 'AUTO' : 'MANUAL'}
                </Text>
            </View>
            <Text style={styles.sizeText}>{item.file_size}</Text>
        </View>
      </View>

      <View style={styles.actionsContainer}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => downloadFile(item.file, item.file_name)}>
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
      <Text style={styles.header}>Gestión de Copias</Text>
      
      <TouchableOpacity 
        style={[styles.mainBtn, processing && styles.disabledBtn]} 
        onPress={handleGenerateBackup}
        disabled={processing}
      >
        {processing ? <ActivityIndicator color="#fff"/> : <Text style={styles.mainBtnText}>+ Generar Nueva Copia</Text>}
      </TouchableOpacity>

      {loading && !refreshing ? (
        <ActivityIndicator size="large" color="#007AFF" style={{marginTop: 20}} />
      ) : (
        <FlatList
          data={backups}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No hay copias disponibles.</Text>
          }
        />
      )}
      
      {processing && (
        <View style={styles.overlay}>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={{color: '#fff', marginTop: 10}}>Procesando...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 50, backgroundColor: '#F2F2F7' },
  header: { fontSize: 28, fontWeight: '800', marginBottom: 25, color: '#1C1C1E' },
  mainBtn: { backgroundColor: '#007AFF', padding: 16, borderRadius: 14, alignItems: 'center', marginBottom: 20 },
  mainBtnText: { color: '#fff', fontWeight: '700', fontSize: 17 },
  disabledBtn: { opacity: 0.6 },
  list: { paddingBottom: 40 },
  emptyText: { textAlign: 'center', color: '#8E8E93', marginTop: 20 },
  card: { backgroundColor: '#fff', padding: 16, borderRadius: 16, marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 3, elevation: 2 },
  infoContainer: { flex: 1, marginRight: 10 },
  fileName: { fontWeight: '600', fontSize: 15, color: '#1C1C1E', marginBottom: 4 },
  dateText: { color: '#8E8E93', fontSize: 13, marginBottom: 8 },
  metaRow: { flexDirection: 'row', alignItems: 'center' },
  sizeText: { color: '#8E8E93', fontSize: 12, fontWeight: '500' },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, marginRight: 8 },
  badgeAuto: { backgroundColor: '#E0F2F1' },   
  badgeManual: { backgroundColor: '#E3F2FD' }, 
  badgeText: { fontSize: 10, fontWeight: '700', color: '#444' },
  actionsContainer: { flexDirection: 'row', gap: 8 },
  actionBtn: { backgroundColor: '#F2F2F7', width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  restoreBtn: { backgroundColor: '#FFF3E0' }, 
  deleteBtn: { backgroundColor: '#FFEBEE' }, 
  actionIcon: { fontSize: 18 },
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', zIndex: 999 }
});