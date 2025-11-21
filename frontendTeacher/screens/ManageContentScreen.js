import React, { useState, useContext, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';
import { getTopics, createTopic, deleteTopic } from '../api/contentRequests';
import { TopicModal } from '../components/ContentModals'; // Importamos el modal
import { BookOpen, PlusCircle, Trash2, ChevronRight } from 'lucide-react-native';
import { COLORS } from '../constants/colors';

export default function ManageContentScreen({ navigation }) {
  const { isSuper } = useContext(AuthContext);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await getTopics();
      setTopics(data);
    } catch (error) {
      Alert.alert('Error', 'No se pudo cargar el contenido');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchData(); }, []));

  const handleCreate = async (data) => {
    try {
      await createTopic(data);
      setModalVisible(false);
      fetchData();
    } catch (e) { Alert.alert('Error', 'Falló la creación del tema'); }
  };

  const handleDelete = (id) => {
    Alert.alert('Confirmar', '¿Eliminar este tema y todo su contenido?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: async () => {
          await deleteTopic(id);
          fetchData();
      }}
    ]);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.card} 
      onPress={() => navigation.navigate('TopicDetail', { topic: item })} // Navegación al detalle
    >
      <View style={styles.cardContent}>
        <BookOpen size={24} color={COLORS.primary} />
        <View style={styles.textContainer}>
          <Text style={styles.cardTitle}>{item.title_es}</Text>
          <Text style={styles.cardSub}>{item.title_en}</Text>
        </View>
      </View>
      <View style={styles.actions}>
        {isSuper && (
          <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.iconBtn}>
            <Trash2 size={20} color={COLORS.danger || 'red'} />
          </TouchableOpacity>
        )}
        <ChevronRight size={20} color="gray" />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Contenido Académico</Text>
        {isSuper && (
          <TouchableOpacity onPress={() => setModalVisible(true)}>
            <PlusCircle size={30} color={COLORS.secondary || 'blue'} />
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} />
      ) : (
        <FlatList
          data={topics}
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchData} />}
          ListEmptyComponent={<Text style={styles.empty}>No hay temas creados.</Text>}
        />
      )}

      <TopicModal visible={modalVisible} onClose={() => setModalVisible(false)} onSubmit={handleCreate} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: COLORS.background || '#f7f9fa' },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: COLORS.text },
  card: { backgroundColor: 'white', padding: 15, borderRadius: 10, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', elevation: 2 },
  cardContent: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  textContainer: { marginLeft: 15 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: COLORS.text },
  cardSub: { fontSize: 12, color: 'gray' },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconBtn: { padding: 5 },
  empty: { textAlign: 'center', marginTop: 30, color: 'gray' }
});