import React, { useState, useContext, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Platform } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getTopicEpigraphs, createEpigraph, updateEpigraph, deleteEpigraph, getEpigraphDetail } from '../api/contentRequests';
import { EpigraphModal } from '../components/ContentModals';
import { Plus, Trash2, Edit } from 'lucide-react-native';
import { COLORS } from '../constants/colors';
import { useLanguage } from '../context/LanguageContext';

export default function TopicDetailScreen({ route, navigation }) {
  const { topic } = route.params;
  const { t } = useLanguage();
  
  const [epigraphs, setEpigraphs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [modalVisible, setModalVisible] = useState(false);
  const [editingEpigraph, setEditingEpigraph] = useState(null);

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

  const handleSave = async (data) => {
    try {
      if (editingEpigraph) {
        await updateEpigraph(topic.id, editingEpigraph.order_id, data);
      } else {
        await createEpigraph(topic.id, data);
      }
      setModalVisible(false);
      setEditingEpigraph(null); 
      fetchEpigraphs();
    } catch (e) { 
      Alert.alert(t('error'), t('error')); 
      console.error(e);
    }
  };

  const handleDelete = (orderId) => {
    const performDelete = async () => {
      try {
        await deleteEpigraph(topic.id, orderId);
        fetchEpigraphs();
      } catch (error) {
        console.error("Error al eliminar", error);
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm(t('deleteEpigraphConfirm'))) {
        performDelete();
      }
    } else {
      Alert.alert(t('delete'), t('deleteEpigraphConfirm'), [
        { text: t('cancel'), style: 'cancel' },
        { 
          text: t('delete'), 
          style: 'destructive', 
          onPress: performDelete 
        }
      ]);
    }
  };

  const openCreateModal = () => {
    setEditingEpigraph(null);
    setModalVisible(true);
  };

  const openEditModal = async (item) => {
    try {
      const detailedData = await getEpigraphDetail(topic.id, item.order_id);
      setEditingEpigraph(detailedData);
      setModalVisible(true);
    } catch (error) {
      console.error("Error fetching details:", error);
      Alert.alert(t('error'), t('error'));
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.info}>
        <View style={{flex: 1}}>
          <Text style={styles.name}>{item.order_id + ". " + item.name}</Text>
          {item.description_es && <Text style={styles.desc} numberOfLines={2}>{item.description_es}</Text>}
        </View>
      </View>
      
      <View style={styles.actions}>
        <TouchableOpacity onPress={() => openEditModal(item)} style={styles.iconBtn}>
          <Edit size={20} color={COLORS.secondary} />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => handleDelete(item.order_id)} style={styles.iconBtn}>
          <Trash2 size={20} color={COLORS.danger} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>{t('epigraphs')}: {topic.title || topic.title_es}</Text>
      
      {loading ? <ActivityIndicator size="large" color={COLORS.primary} /> : (
        <FlatList 
          data={epigraphs}
          renderItem={renderItem}
          keyExtractor={(item) => item.id ? item.id.toString() : item.order_id.toString()}
          ListEmptyComponent={<Text style={styles.empty}>{t('noEpigraphs')}</Text>}
        />
      )}

      <TouchableOpacity style={styles.fab} onPress={openCreateModal}>
        <Plus size={24} color={COLORS.white} />
      </TouchableOpacity>

      <EpigraphModal 
        visible={modalVisible} 
        onClose={() => setModalVisible(false)} 
        onSubmit={handleSave} 
        editingEpigraph={editingEpigraph} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: COLORS.background },
  headerTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, color: COLORS.primary },
  card: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: COLORS.surface, padding: 15, borderRadius: 8, marginBottom: 10, elevation: 1 },
  info: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 10 },
  orderId: { fontWeight: 'bold', marginRight: 10, fontSize: 16, color: COLORS.textSecondary, minWidth: 30 },
  name: { fontSize: 16, fontWeight: '600', color: COLORS.text },
  desc: { fontSize: 12, color: COLORS.textSecondary },
  actions: { flexDirection: 'row', gap: 10 }, 
  iconBtn: { padding: 5 },
  empty: { textAlign: 'center', marginTop: 20, color: COLORS.textSecondary },
  fab: { position: 'absolute', right: 20, bottom: 20, backgroundColor: COLORS.primary, width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', elevation: 5 }
});