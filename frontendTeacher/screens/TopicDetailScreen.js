import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, Alert, ActivityIndicator, Platform } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getTopicEpigraphs, createEpigraph, updateEpigraph, deleteEpigraph, getEpigraphDetail } from '../api/contentRequests';
import { EpigraphModal } from '../components/ContentModals';
import { Plus, Trash2, Edit, FileText } from 'lucide-react-native'; 
import { COLORS } from '../constants/colors';
import { useLanguage } from '../context/LanguageContext';
import { StyledButton } from '../components/StyledButton';

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
      const msg = e.response?.data?.detail || e.response?.data?.non_field_errors?.[0] || e.message || t('error');
      throw new Error(msg);
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
      <View style={styles.iconBox}>
         {/* AUMENTADO: Icono más grande (28) */}
         <FileText size={28} color={COLORS.primary} />
      </View>
      
      <View style={styles.info}>
          <Text style={styles.name}>{item.order_id + ". " +item.name}</Text>
          {item.description_es && (
            <Text style={styles.desc} numberOfLines={1}>
                {item.description_es}
            </Text>
          )}
      </View>
      
      <View style={styles.actions}>
        <StyledButton 
            onPress={() => openEditModal(item)} 
            variant="ghost" 
            size="small" 
            style={styles.iconBtn}
        >
          <Edit size={22} color={COLORS.textSecondary} />
        </StyledButton>

        <StyledButton 
            onPress={() => handleDelete(item.order_id)} 
            variant="ghost" 
            size="small" 
            style={styles.iconBtn}
        >
          <Trash2 size={22} color={COLORS.danger} />
        </StyledButton>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>{t('epigraphs')}: {topic.title || topic.title_es}</Text>
      
      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={{marginTop: 20}} />
      ) : (
        <FlatList 
          data={epigraphs}
          renderItem={renderItem}
          keyExtractor={(item) => item.id ? item.id.toString() : item.order_id.toString()}
          ListEmptyComponent={<Text style={styles.empty}>{t('noEpigraphs')}</Text>}
          contentContainerStyle={{ paddingBottom: 80, gap: 10 }}
        />
      )}

      {/* FAB usando StyledButton */}
      <StyledButton 
        onPress={openCreateModal}
        style={styles.fab}
        icon={<Plus size={28} color={COLORS.white} />}
      />

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
  
  headerTitle: { 
      fontSize: 22, 
      fontWeight: '800', 
      marginBottom: 20, 
      color: COLORS.text 
  },
  
  card: { 
      flexDirection: 'row', 
      alignItems: 'center', 
      backgroundColor: COLORS.surface, 
      padding: 16, 
      borderRadius: 12, 
      borderWidth: 1,
      borderColor: COLORS.borderLight,
      shadowColor: COLORS.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 3,
      elevation: 2
  },
  
  iconBox: {
      // AUMENTADO: Caja más grande para que el icono respire
      width: 48, 
      height: 48, 
      borderRadius: 12,
      backgroundColor: COLORS.primaryVeryLight,
      justifyContent: 'center', alignItems: 'center',
      marginRight: 16
  },

  info: { flex: 1, marginRight: 10 },
  
  name: { 
      fontSize: 16, 
      fontWeight: '700', 
      color: COLORS.text,
      marginBottom: 4
  },
  
  desc: { 
      fontSize: 14, 
      color: COLORS.textSecondary 
  },
  
  actions: { flexDirection: 'row', gap: 4 }, 
  
  // AUMENTADO: Botones de acción un poco más grandes
  iconBtn: { padding: 8, width: 40, height: 40, justifyContent: 'center', alignItems: 'center' }, 
  
  empty: { textAlign: 'center', marginTop: 40, color: COLORS.textSecondary, fontSize: 16 },
  
  fab: { 
      position: 'absolute', 
      right: 20, 
      bottom: 20, 
      width: 60,  // AUMENTADO
      height: 60, // AUMENTADO
      borderRadius: 30, 
      paddingHorizontal: 0, 
      paddingVertical: 0,
      justifyContent: 'center', 
      alignItems: 'center', 
      elevation: 5,
      shadowColor: COLORS.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 4.65,
  }
});