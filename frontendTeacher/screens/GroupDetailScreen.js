import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, Button, Alert, TouchableOpacity, Share, Platform } from 'react-native';
import { deleteGroup } from '../api/getRequest'; // Ajusta la ruta
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import { COLORS } from '../constants/colors';
import {Clipboard} from 'react-native';
import { Copy, Trash2, BarChart } from 'lucide-react-native';

export default function GroupDetailScreen({ route, navigation }) {
  const { group } = route.params;
  const [modalVisible, setModalVisible] = useState(false);

  // La API no es clara sobre cómo se obtiene el access_code. 
  // Asumo que viene en el objeto 'group' de la lista.
  // Si no, se necesitaría otra llamada a la API aquí.
  // La API DOC dice: GET /studentgroups/exists/?code=XXX-XXX, por lo que el código se llama 'code'
  const accessCode = group.groupCode; // O group.access_code, group.groupCode, etc.

  const handleDelete = async () => {
    try {
      // El endpoint de borrado necesita (subjectId, groupId)
      // Asumo que el objeto 'group' de la lista tiene 'subject' (ID) y 'id' (ID)
      await deleteGroup(group.subject.id, group.id);
      setModalVisible(false);
      Alert.alert('Éxito', 'Grupo eliminado correctamente.');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'No se pudo eliminar el grupo.');
      setModalVisible(false);
    }
  };

  const copyToClipboard = () => {
    Clipboard.setString(accessCode);
    Alert.alert('Copiado', 'Código de acceso copiado al portapapeles.');
  };
  
  const shareCode = () => {
    Share.share({
      message: `Únete a mi grupo en Proyecto PiD con este código: ${accessCode}`,
      title: 'Código de Grupo'
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{group.name_es}</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Código de Acceso</Text>
        <Text style={styles.accessCode}>{accessCode || 'N/A'}</Text>
        <TouchableOpacity style={styles.copyButton} onPress={copyToClipboard}>
          <Copy size={20} color={COLORS.primary || 'blue'} />
          <Text style={styles.copyButtonText}>Copiar código</Text>
        </TouchableOpacity>
        <Button title="Compartir Código" onPress={shareCode} />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Gestión</Text>
        
        <TouchableOpacity style={styles.actionButton} onPress={() => Alert.alert('Próximamente', 'Las estadísticas estarán disponibles pronto.')}>
          <BarChart size={22} color={COLORS.text} />
          <Text style={styles.actionButtonText}>Ver Estadísticas</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.actionButton, styles.deleteButton]} 
          onPress={() => setModalVisible(true)}
        >
          <Trash2 size={22} color={COLORS.danger || 'red'} />
          <Text style={[styles.actionButtonText, styles.deleteButtonText]}>
            Eliminar Grupo
          </Text>
        </TouchableOpacity>
      </View>

      <ConfirmDeleteModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onConfirm={handleDelete}
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
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 20,
    color: COLORS.text,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    ...(Platform.OS === 'web'
      ? { boxShadow: '0px 1px 3px rgba(0,0,0,0.1)' }
      : {
          shadowColor: '#000',
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
    color: COLORS.primaryDark || 'black',
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
    backgroundColor: COLORS.primaryLight || '#e0f7fa',
    alignSelf: 'center',
    marginBottom: 15,
  },
  copyButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: COLORS.primary || 'blue',
    fontWeight: '500',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
    backgroundColor: COLORS.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.secondary || '#ccc',
    marginBottom: 10,
  },
  actionButtonText: {
    fontSize: 16,
    marginLeft: 15,
    fontWeight: '500',
    color: COLORS.text,
  },
  deleteButton: {
    borderColor: COLORS.danger || 'red',
  },
  deleteButtonText: {
    color: COLORS.danger || 'red',
  },
});