import React, { useState, useContext, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';
// IMPORTAMOS LA NUEVA FUNCIÓN UPDATE
import { getTopicEpigraphs, createEpigraph, updateEpigraph, deleteEpigraph } from '../api/contentRequests';
import { EpigraphModal } from '../components/ContentModals';
// IMPORTAMOS EL ICONO EDIT
import { List, Plus, Trash2, Edit } from 'lucide-react-native';
import { COLORS } from '../constants/colors';

export default function TopicDetailScreen({ route, navigation }) {
  const { topic } = route.params;
  const { isSuper } = useContext(AuthContext);
  
  const [epigraphs, setEpigraphs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Estado para el modal
  const [modalVisible, setModalVisible] = useState(false);
  const [editingEpigraph, setEditingEpigraph] = useState(null); // Nuevo estado

  const fetchEpigraphs = async () => {
    try {
      setLoading(true);
      const data = await getTopicEpigraphs(topic.id);
      const sorted = data.sort((a, b) => parseFloat(a.order_id) - parseFloat(b.order_id));
      setEpigraphs(sorted);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchEpigraphs(); }, [topic.id]));

  // Función unificada para Guardar (Crear o Editar)
  const handleSave = async (data) => {
    try {
      if (editingEpigraph) {
        // ACTUALIZAR
        // Nota: Pasamos editingEpigraph.order_id como identificador original por si el usuario cambia el order_id en el form
        await updateEpigraph(topic.id, editingEpigraph.order_id, data);
      } else {
        // CREAR
        await createEpigraph(topic.id, data);
      }
      setModalVisible(false);
      setEditingEpigraph(null); // Limpiar estado de edición
      fetchEpigraphs();
    } catch (e) { 
      Alert.alert('Error', 'No se pudo guardar el epígrafe. Revisa si el ID de orden ya existe.'); 
      console.error(e);
    }
  };

  const handleDelete = (orderId) => {
    Alert.alert('Eliminar', '¿Seguro?', [
      { text: 'Cancelar' },
      { text: 'Eliminar', style: 'destructive', onPress: async () => {
         await deleteEpigraph(topic.id, orderId);
         fetchEpigraphs();
      }}
    ]);
  };

  // Abrir modal para crear
  const openCreateModal = () => {
    setEditingEpigraph(null);
    setModalVisible(true);
  };

  // Abrir modal para editar
  const openEditModal = (item) => {
    setEditingEpigraph(item);
    setModalVisible(true);
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.info}>
         <Text style={styles.orderId}>{item.order_id}</Text>
         <View style={{flex: 1}}>
            <Text style={styles.name}>{item.name || item.name_es}</Text>
            {item.description_es && <Text style={styles.desc} numberOfLines={2}>{item.description_es}</Text>}
         </View>
      </View>
      
      {isSuper && (
        <View style={styles.actions}>
            {/* BOTÓN EDITAR */}
            <TouchableOpacity onPress={() => openEditModal(item)} style={styles.iconBtn}>
              <Edit size={20} color={COLORS.secondary || 'blue'} />
            </TouchableOpacity>

            {/* BOTÓN ELIMINAR */}
            <TouchableOpacity onPress={() => handleDelete(item.order_id)} style={styles.iconBtn}>
              <Trash2 size={20} color={COLORS.danger || 'red'} />
            </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Epígrafes de: {topic.title || topic.title_es}</Text>
      
      {loading ? <ActivityIndicator size="large" color={COLORS.primary} /> : (
        <FlatList 
          data={epigraphs}
          renderItem={renderItem}
          keyExtractor={(item) => item.id ? item.id.toString() : item.order_id.toString()}
          ListEmptyComponent={<Text style={styles.empty}>No hay epígrafes definidos.</Text>}
        />
      )}

      {isSuper && (
        <TouchableOpacity style={styles.fab} onPress={openCreateModal}>
          <Plus size={24} color="white" />
        </TouchableOpacity>
      )}

      <EpigraphModal 
        visible={modalVisible} 
        onClose={() => setModalVisible(false)} 
        onSubmit={handleSave} 
        editingEpigraph={editingEpigraph} // Pasamos el objeto a editar
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: COLORS.background },
  headerTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, color: COLORS.primary },
  card: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'white', padding: 15, borderRadius: 8, marginBottom: 10, elevation: 1 },
  info: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 10 },
  orderId: { fontWeight: 'bold', marginRight: 10, fontSize: 16, color: '#555', minWidth: 30 },
  name: { fontSize: 16, fontWeight: '600', color: '#333' },
  desc: { fontSize: 12, color: 'gray' },
  actions: { flexDirection: 'row', gap: 10 }, // Contenedor para los iconos
  iconBtn: { padding: 5 },
  empty: { textAlign: 'center', marginTop: 20, color: 'gray' },
  fab: { position: 'absolute', right: 20, bottom: 20, backgroundColor: COLORS.primary, width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', elevation: 5 }
});