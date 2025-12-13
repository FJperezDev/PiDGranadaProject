import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, Platform, ScrollView } from 'react-native';
import DraggableFlatList, { ScaleDecorator } from 'react-native-draggable-flatlist';
import { swapTopicOrder } from '../api/coursesRequests';
import { COLORS } from '../constants/colors';
// Importamos iconos de flechas
import { GripVertical, ArrowUp, ArrowDown } from 'lucide-react-native'; 

export default function SubjectTopicsScreen({ route, navigation }) {
  const { subject } = route.params;
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(false); // Cambiado a false inicial porque ya tienes los datos

  useEffect(() => {
    // Ordenamos por si acaso no vienen ordenados
    // Asumiendo que tienen un campo order_id o similar, si no, usa el orden del array
    setTopics(subject.topics || []);
  }, []);

  const handleSwap = async (indexA, indexB) => {
    const newTopics = [...topics];
    // Intercambio visual
    [newTopics[indexA], newTopics[indexB]] = [newTopics[indexB], newTopics[indexA]];
    setTopics(newTopics);

    try {
      await swapTopicOrder(subject.id, topics[indexA].title, topics[indexB].title);
    } catch (error) {
      // Revertir si falla
      setTopics(topics); 
      Alert.alert('Error', 'No se pudo guardar el orden.');
    }
  };

  // --- RENDERIZADO PARA MÓVIL (DRAG & DROP) ---
  const renderItemMobile = ({ item, drag, isActive }) => {
    return (
      <ScaleDecorator>
        <TouchableOpacity
          onLongPress={drag}
          disabled={isActive}
          style={[
            styles.rowItem,
            { backgroundColor: isActive ? '#f0f0f0' : COLORS.white || 'white' },
          ]}
        >
          <TouchableOpacity onPressIn={drag} style={styles.dragHandle}>
            <GripVertical size={24} color={COLORS.gray || '#ccc'} />
          </TouchableOpacity>
          <View style={styles.textContainer}>
            <Text style={styles.topicTitle}>{item.title}</Text>
          </View>
        </TouchableOpacity>
      </ScaleDecorator>
    );
  };

  // --- RENDERIZADO PARA WEB (FLECHAS) ---
  const renderItemWeb = (item, index) => {
    const isFirst = index === 0;
    const isLast = index === topics.length - 1;

    return (
      <View key={item.id} style={styles.rowItem}>
        <View style={styles.webControls}>
          <TouchableOpacity 
            onPress={() => !isFirst && handleSwap(index, index - 1)}
            disabled={isFirst}
            style={[styles.arrowButton, isFirst && styles.disabledArrow]}
          >
            <ArrowUp size={20} color={isFirst ? '#eee' : COLORS.gray} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={() => !isLast && handleSwap(index, index + 1)}
            disabled={isLast}
            style={[styles.arrowButton, isLast && styles.disabledArrow]}
          >
            <ArrowDown size={20} color={isLast ? '#eee' : COLORS.gray} />
          </TouchableOpacity>
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.topicTitle}>{item.title}</Text>
        </View>
      </View>
    );
  };

  const onDragEnd = async ({ data, from, to }) => {
    if (from === to) return;
    const originalData = [...topics];
    setTopics(data);
    try {
      // Tu lógica de swap
      const topicMoved = originalData[from];
      const topicDisplaced = originalData[to];
      await swapTopicOrder(subject.id, topicMoved.title, topicDisplaced.title);
    } catch (error) {
      setTopics(originalData);
      Alert.alert('Error', 'Fallo al reordenar');
    }
  };

  if (loading) return <ActivityIndicator style={styles.loader} size="large" />;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{subject.name_es || subject.name}</Text>
        <Text style={styles.headerSubtitle}>
          {Platform.OS === 'web' ? 'Usa las flechas para reordenar' : 'Mantén presionado para arrastrar'}
        </Text>
      </View>

      {/* RENDERIZADO CONDICIONAL SEGÚN PLATAFORMA */}
      {Platform.OS === 'web' ? (
        <ScrollView style={styles.list}>
          {topics.map((item, index) => renderItemWeb(item, index))}
        </ScrollView>
      ) : (
        <DraggableFlatList
          data={topics}
          onDragEnd={onDragEnd}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItemMobile}
          containerStyle={styles.list}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background || '#f7f9fa' },
  loader: { flex: 1, justifyContent: 'center' },
  header: { padding: 20, backgroundColor: 'white', borderBottomWidth: 1, borderColor: '#eee' },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: COLORS.text },
  headerSubtitle: { fontSize: 14, color: 'gray', marginTop: 4 },
  list: { flex: 1 },
  
  rowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 6,
    backgroundColor: 'white',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
    // Estilos extra para web
    borderWidth: Platform.OS === 'web' ? 1 : 0,
    borderColor: '#eee',
  },
  
  // Estilos específicos para Web
  webControls: {
    flexDirection: 'column',
    marginRight: 15,
    gap: 4,
  },
  arrowButton: {
    padding: 4,
    borderRadius: 4,
    backgroundColor: '#f5f5f5',
  },
  disabledArrow: {
    backgroundColor: 'transparent',
  },

  // Estilos específicos para Móvil
  dragHandle: { paddingRight: 16, justifyContent: 'center' },
  
  textContainer: { flex: 1 },
  topicTitle: { fontSize: 16, fontWeight: '600', color: COLORS.text },
});