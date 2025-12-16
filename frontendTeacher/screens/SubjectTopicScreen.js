import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, 
  Alert, Platform, ScrollView, Modal, FlatList 
} from 'react-native';
import DraggableFlatList, { ScaleDecorator } from 'react-native-draggable-flatlist';
import { 
  swapTopicOrder, 
  getSubject, // Usamos esto para obtener la asignatura completa con sus topics
} from '../api/coursesRequests';
import { getTopics, subjectIsAboutTopic, subjectIsNotAboutTopic  } from '../api/contentRequests'; 
import { COLORS } from '../constants/colors';
import { GripVertical, ArrowUp, ArrowDown, ListFilter, Check, X } from 'lucide-react-native'; 
import { useLanguage } from '../context/LanguageContext';
import { StyledButton } from '../components/StyledButton';

export default function SubjectTopicsScreen({ route, navigation }) {
  const { t, language } = useLanguage(); // 'language' disparará el useEffect
  const { subject } = route.params;
  
  // Estado
  const [thisSubject, setThisSubject] = useState(subject); // Datos de la asignatura (Titulo, desc, etc)
  const [topics, setTopics] = useState([]); // Lista de temas VINCLULADOS (Ordenados)
  const [allTopics, setAllTopics] = useState([]); // Lista MAESTRA de temas (Para el modal)
  
  const [loading, setLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const [processingId, setProcessingId] = useState(null);

  // --- 1. CARGA DE DATOS ---
  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Ejecutamos las dos peticiones en paralelo
      const [updatedSubjectData, allTopicsData] = await Promise.all([
        getSubject(subject.id), // Trae la asignatura fresca con sus .topics
        getTopics()             // Trae todos los temas disponibles del sistema
      ]);
      
      // 1. Actualizamos la asignatura (para que se traduzca el título si cambia el idioma)
      setThisSubject(updatedSubjectData);

      // 2. Extraemos los temas ya vinculados y ordenados que vienen dentro de la asignatura
      // Asumimos que updatedSubjectData.topics ya viene ordenado por el backend
      setTopics(updatedSubjectData.topics || []);

      // 3. Guardamos la lista total para el selector
      setAllTopics(allTopicsData || []);

    } catch (error) {
      console.error(error);
      Alert.alert(t('error'), t('error'));
    } finally {
      setLoading(false);
    }
  };

  // Este efecto se ejecuta al montar Y cuando cambia el idioma
  useEffect(() => {
    fetchData();
  }, [language]);

  // --- 2. LÓGICA DE ORDENACIÓN DEL MODAL ---
  const getSortedOptions = () => {
    if (allTopics.length === 0) return [];
    
    // Mapa para saber rápido si un tema está seleccionado y en qué posición
    const selectedTopicsMap = new Map();
    topics.forEach((t, index) => selectedTopicsMap.set(t.id, index));

    const selectedList = [];
    const unselectedList = [];

    allTopics.forEach(topic => {
      // Usamos title (si viene traducido del back) o fallback a title_es
      const displayTitle = topic.title || topic.title_es || "";

      if (selectedTopicsMap.has(topic.id)) {
        // Si está seleccionado, guardamos su orden actual
        selectedList.push({ ...topic, _sortOrder: selectedTopicsMap.get(topic.id) });
      } else {
        unselectedList.push(topic);
      }
    });

    // Ordenar los seleccionados por su orden visual actual
    selectedList.sort((a, b) => a._sortOrder - b._sortOrder);
    
    // Ordenar los NO seleccionados alfabéticamente
    unselectedList.sort((a, b) => {
        const titleA = a.title || a.title_es || "";
        const titleB = b.title || b.title_es || "";
        return titleA.localeCompare(titleB);
    });

    return [...selectedList, ...unselectedList];
  };

  const sortedModalData = getSortedOptions();

  // --- 3. VINCULAR / DESVINCULAR ---
  const toggleTopicLink = async (topicItem) => {
    const isLinked = topics.some(t => t.id === topicItem.id);
    // IMPORTANTE: Usar el nombre en español suele ser el identificador único para relaciones en tu backend actual
    const topicName = topicItem.title_es || topicItem.title; 

    setProcessingId(topicItem.id);

    try {
      if (isLinked) {
        await subjectIsNotAboutTopic(thisSubject.id, topicName);
      } else {
        await subjectIsAboutTopic(thisSubject.id, topicName);
      }
      
      // Recargamos los datos para obtener la lista actualizada y ordenada desde el servidor
      // En lugar de llamar solo a getSubjectTopics, llamamos a getSubject para ser consistentes
      const updatedSubject = await getSubject(thisSubject.id);
      setTopics(updatedSubject.topics || []);
      
    } catch (error) {
      console.error(error);
      Alert.alert(t('error'), t('error'));
    } finally {
      setProcessingId(null);
    }
  };

  // --- 4. REORDENAR ---
  const handleSwap = async (indexA, indexB) => {
    const newTopics = [...topics];
    // Swap visual optimista
    [newTopics[indexA], newTopics[indexB]] = [newTopics[indexB], newTopics[indexA]];
    setTopics(newTopics);

    try {
      // Enviamos el cambio al backend
      await swapTopicOrder(thisSubject.id, topics[indexA].title, topics[indexB].title);
    } catch (error) {
      // Revertir si falla (usamos la lista anterior al cambio, que sería recargarla)
      console.error(error);
      Alert.alert(t('error'), t('error'));
      fetchData(); // Recarga lo real
    }
  };

  const onDragEnd = async ({ data, from, to }) => {
    if (from === to) return;
    const originalData = [...topics];
    setTopics(data); // Actualización visual inmediata
    
    try {
      const topicMoved = originalData[from];
      const topicDisplaced = originalData[to];
      await swapTopicOrder(thisSubject.id, topicMoved.title, topicDisplaced.title);
    } catch (error) {
      setTopics(originalData); // Revertir
      Alert.alert(t('error'), t('error'));
    }
  };

  // --- 5. RENDERIZADO ---

  const renderItemMobile = ({ item, drag, isActive }) => (
    <ScaleDecorator>
      <TouchableOpacity
        onLongPress={drag}
        disabled={isActive}
        style={[
          styles.rowItem,
          { backgroundColor: isActive ? '#f0f0f0' : COLORS.surface },
        ]}
      >
        <TouchableOpacity onPressIn={drag} style={styles.dragHandle}>
          <GripVertical size={24} color={COLORS.gray} />
        </TouchableOpacity>
        <View style={styles.textContainer}>
          <Text style={styles.topicTitle}>{item.title || item.title_es}</Text>
        </View>
      </TouchableOpacity>
    </ScaleDecorator>
  );

  const renderItemWeb = (item, index) => {
    const isFirst = index === 0;
    const isLast = index === topics.length - 1;
    return (
      <View key={item.id} style={styles.rowItem}>
        <View style={styles.webControls}>
          <StyledButton 
            onPress={() => !isFirst && handleSwap(index, index - 1)}
            disabled={isFirst}
            style={[styles.arrowButton, isFirst && styles.disabledArrow]}
            variant="ghost"
          >
            <ArrowUp size={20} color={isFirst ? '#eee' : COLORS.gray} />
          </StyledButton>
          <StyledButton 
            onPress={() => !isLast && handleSwap(index, index + 1)}
            disabled={isLast}
            style={[styles.arrowButton, isLast && styles.disabledArrow]}
            variant="ghost"
          >
            <ArrowDown size={20} color={isLast ? '#eee' : COLORS.gray} />
          </StyledButton>
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.topicTitle}>{item.title || item.title_es}</Text>
        </View>
      </View>
    );
  };

  if (loading) return <ActivityIndicator style={styles.loader} size="large" color={COLORS.primary} />;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={{flex: 1}}>
            {/* Usamos thisSubject que se actualiza con el idioma */}
            <Text style={styles.headerTitle}>{thisSubject.name || thisSubject.name_es}</Text>
            <Text style={styles.headerSubtitle}>
               {t('touchToOrder')}
            </Text>
        </View>
        
        <StyledButton 
            style={styles.filterButton} 
            onPress={() => setShowDropdown(true)}
            variant="ghost"
        >
            <ListFilter size={24} color={COLORS.primary} />
            <Text style={styles.filterButtonText}>{t('topics')}</Text>
        </StyledButton>
      </View>

      {Platform.OS === 'web' ? (
        <ScrollView style={styles.list}>
          {topics.map((item, index) => renderItemWeb(item, index))}
          {topics.length === 0 && <Text style={styles.emptyText}>{t('noContent')}</Text>}
        </ScrollView>
      ) : (
        <DraggableFlatList
          data={topics}
          onDragEnd={onDragEnd}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItemMobile}
          containerStyle={styles.list}
          ListEmptyComponent={<Text style={styles.emptyText}>{t('noContent')}</Text>}
        />
      )}

      {/* --- MODAL --- */}
      <Modal
        visible={showDropdown}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDropdown(false)}
      >
        <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>{t('manageTopics')}</Text>
                    <TouchableOpacity onPress={() => setShowDropdown(false)}>
                        <X size={24} color={COLORS.text} />
                    </TouchableOpacity>
                </View>
                
                <Text style={styles.modalSubtitle}>{t('linkedTopicsInfo')}</Text>

                <FlatList 
                    data={sortedModalData} 
                    keyExtractor={(item) => item.id.toString()}
                    style={{maxHeight: 400}}
                    renderItem={({ item }) => {
                        const isSelected = topics.some(t => t.id === item.id);
                        const isProcessing = processingId === item.id;
                        const displayTitle = item.title || item.title_es;

                        return (
                            <TouchableOpacity 
                                style={[styles.optionRow, isSelected && styles.optionRowSelected]}
                                onPress={() => toggleTopicLink(item)}
                                disabled={isProcessing}
                            >
                                <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                                    {displayTitle}
                                </Text>
                                {isProcessing ? (
                                    <ActivityIndicator size="small" color={COLORS.primary} />
                                ) : (
                                    isSelected && <Check size={20} color={COLORS.primary} />
                                )}
                            </TouchableOpacity>
                        );
                    }}
                />
                
                <StyledButton 
                    style={styles.closeButton} 
                    onPress={() => setShowDropdown(false)}
                >
                    <Text style={styles.closeButtonText}>{t('ok')}</Text>
                </StyledButton>
            </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  loader: { flex: 1, justifyContent: 'center' },
  
  header: { 
      padding: 20, 
      backgroundColor: COLORS.surface, 
      borderBottomWidth: 1, 
      borderColor: COLORS.border,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between'
  },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: COLORS.text },
  headerSubtitle: { fontSize: 14, color: COLORS.textSecondary, marginTop: 4 },
  
  filterButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#f0f9ff',
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: '#bae6fd'
  },
  filterButtonText: {
      marginLeft: 6,
      color: COLORS.primary,
      fontWeight: '600'
  },

  list: { flex: 1 },
  emptyText: { textAlign: 'center', marginTop: 40, color: COLORS.textSecondary, fontSize: 16 },

  rowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 6,
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
    borderWidth: Platform.OS === 'web' ? 1 : 0,
    borderColor: COLORS.border,
  },
  
  webControls: { flexDirection: 'column', marginRight: 15, gap: 4 },
  arrowButton: { padding: 4, borderRadius: 4, backgroundColor: COLORS.background },
  disabledArrow: { opacity: 0.3 },

  dragHandle: { paddingRight: 16, justifyContent: 'center' },
  textContainer: { flex: 1 },
  topicTitle: { fontSize: 16, fontWeight: '600', color: COLORS.text },

  modalOverlay: {
      flex: 1,
      backgroundColor: COLORS.overlay,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20
  },
  modalContent: {
      width: '100%',
      maxWidth: 500,
      backgroundColor: COLORS.surface,
      borderRadius: 16,
      padding: 20,
      ...Platform.select({
          web: { boxShadow: '0px 10px 25px rgba(0,0,0,0.2)' },
          default: { elevation: 5 }
      })
  },
  modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 15
  },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.text },
  modalSubtitle: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 15 },
  
  optionRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 14,
      paddingHorizontal: 10,
      borderBottomWidth: 1,
      borderBottomColor: COLORS.background
  },
  optionRowSelected: {
      backgroundColor: '#f0f9ff'
  },
  optionText: { fontSize: 16, color: COLORS.textSecondary },
  optionTextSelected: { color: COLORS.primary, fontWeight: '600' },

  closeButton: {
      marginTop: 15,
      backgroundColor: COLORS.primary,
      padding: 12,
      borderRadius: 10,
      alignItems: 'center'
  },
  closeButtonText: { color: COLORS.white, fontWeight: 'bold', fontSize: 16 }
});