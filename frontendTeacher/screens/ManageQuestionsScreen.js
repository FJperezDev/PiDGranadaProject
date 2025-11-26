import React, { useState, useCallback, useContext, useMemo } from 'react';
import { 
    View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, 
    ActivityIndicator, Platform, ScrollView, LayoutAnimation, UIManager 
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext'; 
import { getQuestions, deleteQuestion } from '../api/evaluationRequests';
import { COLORS } from '../constants/colors';
import { Edit, Trash2, FileSpreadsheet, Plus, Filter, X, Book, ChevronDown, ChevronUp } from 'lucide-react-native'; 
import QuestionWizardModal from '../components/QuestionWizardModal';

// Habilitar animaciones en Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function ManageQuestionsScreen({ navigation }) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // --- ESTADOS PARA FILTROS ---
  const [selectedTopics, setSelectedTopics] = useState([]); 
  const [selectedSubjects, setSelectedSubjects] = useState([]); 
  
  // 1. FILTROS OCULTOS POR DEFECTO (false)
  const [showFilters, setShowFilters] = useState(false); 

  // Control del Modal
  const [modalVisible, setModalVisible] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const data = await getQuestions();
      setQuestions(data);
    } catch (error) {
      Alert.alert("Error", "No se pudieron cargar las preguntas.");
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchQuestions();
    }, [])
  );

  // --- TOGGLE FILTROS ANIMADO ---
  const toggleFilters = () => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setShowFilters(!showFilters);
  };

  // --- HELPERS PARA EXTRAER DATOS ---
  const getTopicsFromItem = (item) => {
    let topicNames = [];
    if (item.topics && Array.isArray(item.topics)) {
        topicNames = item.topics.map(t => t.name || t.title).filter(Boolean);
    } else if (item.topics_titles && Array.isArray(item.topics_titles)) {
        topicNames = item.topics_titles;
    }
    return [...new Set(topicNames)];
  };

  const getSubjectsFromItem = (item) => {
    let subjectNames = [];
    if (item.subjects && Array.isArray(item.subjects)) {
        subjectNames = item.subjects.map(s => s.name).filter(Boolean);
    }
    return [...new Set(subjectNames)];
  };

  // --- LISTAS DE FILTROS ÚNICOS (useMemo) ---
  const allUniqueTopics = useMemo(() => {
    const set = new Set();
    questions.forEach(q => getTopicsFromItem(q).forEach(t => set.add(t)));
    return Array.from(set).sort();
  }, [questions]);

  const allUniqueSubjects = useMemo(() => {
    const set = new Set();
    questions.forEach(q => getSubjectsFromItem(q).forEach(s => set.add(s)));
    return Array.from(set).sort();
  }, [questions]);

  // --- LÓGICA DE FILTRADO ---
  const filteredQuestions = useMemo(() => {
    return questions.filter(item => {
        const itemTopics = getTopicsFromItem(item);
        const itemSubjects = getSubjectsFromItem(item);

        const matchesTopic = selectedTopics.length === 0 || itemTopics.some(t => selectedTopics.includes(t));
        const matchesSubject = selectedSubjects.length === 0 || itemSubjects.some(s => selectedSubjects.includes(s));

        return matchesTopic && matchesSubject;
    });
  }, [questions, selectedTopics, selectedSubjects]);

  // --- HANDLERS ---
  const toggleTopicFilter = (topic) => {
    setSelectedTopics(prev => prev.includes(topic) ? prev.filter(t => t !== topic) : [...prev, topic]);
  };

  const toggleSubjectFilter = (subject) => {
    setSelectedSubjects(prev => prev.includes(subject) ? prev.filter(s => s !== subject) : [...prev, subject]);
  };

  const handleDelete = (id) => {
    const performDelete = async () => {
      try {
        await deleteQuestion(id);
        fetchQuestions();
      } catch (error) {
        console.error("Error al eliminar", error);
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm('Eliminar: ¿Seguro que quieres eliminar esta pregunta?')) {
        performDelete();
      }
    } else {
      Alert.alert('Eliminar', '¿Seguro?', [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: performDelete }
      ]);
    }
  };

  const handleEdit = (item) => { setEditingQuestion(item); setModalVisible(true); };
  const handleCreate = () => { setEditingQuestion(null); setModalVisible(true); };
  const handleUploadExcel = () => { Alert.alert("Subir Excel", "Funcionalidad pendiente."); };

  const renderItem = ({ item }) => {
    const topicNames = getTopicsFromItem(item);
    const subjectNames = getSubjectsFromItem(item);
    
    return (
      <View style={styles.row}>
        <View style={styles.infoCol}>
            <View style={styles.tagsRow}>
                 {subjectNames.map((name, index) => (
                    <View key={`sub-${index}`} style={[styles.tagContainer, { backgroundColor: '#e8f5e9' }]}>
                        <Text style={[styles.tagText, { color: '#2e7d32' }]}>{name}</Text>
                    </View>
                ))}
                {topicNames.map((name, index) => (
                    <View key={`top-${index}`} style={styles.tagContainer}>
                        <Text style={styles.tagText}>{name}</Text>
                    </View>
                ))}
            </View>
            <Text style={styles.statement} numberOfLines={2}>
                {item.statement}
            </Text>
        </View>

        <View style={styles.actionsCol}>
            <TouchableOpacity onPress={() => handleEdit(item)} style={styles.iconBtn}>
                <Edit size={22} color={COLORS.primary || 'blue'} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.iconBtn}>
                <Trash2 size={22} color={COLORS.danger || 'red'} />
            </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* HEADER PRINCIPAL */}
      <View style={styles.topHeader}>
         <Text style={styles.screenTitle}>Preguntas</Text>
         <View style={styles.headerButtons}>
             <TouchableOpacity style={styles.excelBtn} onPress={handleUploadExcel}>
                 <FileSpreadsheet size={20} color="white" />
                 <Text style={styles.btnText}>Excel</Text>
             </TouchableOpacity>
             <TouchableOpacity style={styles.addBtn} onPress={handleCreate}>
                 <Plus size={20} color="white" />
                 <Text style={styles.btnText}>Nueva</Text>
             </TouchableOpacity>
         </View>
      </View>

      {/* --- CONTENEDOR DE FILTROS DESPLEGABLE --- */}
      <View style={styles.filtersCard}>
          {/* Cabecera del acordeón */}
          <TouchableOpacity onPress={toggleFilters} style={styles.accordionHeader}>
              <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
                  <Filter size={18} color="#333" />
                  <Text style={styles.accordionTitle}>Filtros</Text>
                  {!showFilters && (selectedSubjects.length > 0 || selectedTopics.length > 0) && (
                      <View style={styles.badge}>
                          <Text style={styles.badgeText}>{selectedSubjects.length + selectedTopics.length}</Text>
                      </View>
                  )}
              </View>
              {showFilters ? <ChevronUp size={20} color="gray"/> : <ChevronDown size={20} color="gray"/>}
          </TouchableOpacity>

          {/* Contenido Ocultable */}
          {showFilters && (
            <View style={styles.accordionContent}>
                
                {/* 1. FILTRO ASIGNATURAS (Scroll Horizontal - 1 Línea) */}
                <View style={styles.filterSection}>
                    <View style={styles.sectionHeader}>
                        <Book size={14} color="#666" />
                        <Text style={styles.sectionLabel}>Asignaturas</Text>
                        {selectedSubjects.length > 0 && (
                            <TouchableOpacity onPress={() => setSelectedSubjects([])}><Text style={styles.clearFilterText}>Limpiar</Text></TouchableOpacity>
                        )}
                    </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsScroll}>
                        {allUniqueSubjects.map((sub, index) => {
                            const isActive = selectedSubjects.includes(sub);
                            return (
                                <TouchableOpacity key={index} onPress={() => toggleSubjectFilter(sub)} style={[styles.chip, isActive ? styles.chipActiveSub : styles.chipInactive]}>
                                    <Text style={[styles.chipText, isActive ? styles.chipTextActive : styles.chipTextInactive]}>{sub}</Text>
                                    {isActive && <X size={12} color="white" style={{marginLeft: 4}} />}
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                </View>

                {/* Separador */}
                <View style={styles.separator} />

                {/* 2. FILTRO TEMAS (Multi-línea / 2 filas si es necesario) */}
                <View style={styles.filterSection}>
                    <View style={styles.sectionHeader}>
                        <Filter size={14} color="#666" />
                        <Text style={styles.sectionLabel}>Temas</Text>
                        {selectedTopics.length > 0 && (
                            <TouchableOpacity onPress={() => setSelectedTopics([])}><Text style={styles.clearFilterText}>Limpiar</Text></TouchableOpacity>
                        )}
                    </View>
                    
                    {/* CAMBIO AQUÍ: Usamos View con FlexWrap en lugar de ScrollView Horizontal */}
                    <View style={styles.chipsWrapper}>
                        {allUniqueTopics.map((topic, index) => {
                            const isActive = selectedTopics.includes(topic);
                            return (
                                <TouchableOpacity key={index} onPress={() => toggleTopicFilter(topic)} style={[styles.chip, isActive ? styles.chipActive : styles.chipInactive]}>
                                    <Text style={[styles.chipText, isActive ? styles.chipTextActive : styles.chipTextInactive]}>{topic}</Text>
                                    {isActive && <X size={12} color="white" style={{marginLeft: 4}} />}
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>
            </View>
          )}
      </View>

      {/* --- RESULTADOS --- */}
      <View style={styles.tableHeader}>
          <Text style={styles.tableHeadText}>
            {filteredQuestions.length} Pregunta{filteredQuestions.length !== 1 ? 's' : ''} encontrada{filteredQuestions.length !== 1 ? 's' : ''}
          </Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" style={{marginTop: 20}} color={COLORS.primary} />
      ) : (
        <FlatList
          data={filteredQuestions}
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={{ paddingBottom: 80 }}
          ListEmptyComponent={<View style={styles.emptyContainer}><Text style={styles.empty}>No hay resultados.</Text></View>}
        />
      )}

      <QuestionWizardModal 
        visible={modalVisible} 
        onClose={() => setModalVisible(false)} 
        onSaveSuccess={fetchQuestions}
        editingQuestion={editingQuestion}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  
  // Header
  topHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, backgroundColor: 'white', elevation: 2, zIndex: 10 },
  screenTitle: { fontSize: 22, fontWeight: 'bold', color: COLORS.text },
  headerButtons: { flexDirection: 'row', gap: 10 },
  excelBtn: { flexDirection: 'row', backgroundColor: '#217346', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 6, alignItems: 'center', gap: 6 },
  addBtn: { flexDirection: 'row', backgroundColor: COLORS.primary || 'blue', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 6, alignItems: 'center', gap: 6 },
  btnText: { color: 'white', fontWeight: '600', fontSize: 13 },

  // --- ESTILOS DEL ACORDEÓN DE FILTROS ---
  filtersCard: {
      backgroundColor: 'white',
      marginHorizontal: 15,
      marginTop: 15,
      borderRadius: 10,
      elevation: 2, 
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      overflow: 'hidden'
  },
  accordionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 15,
      backgroundColor: 'white'
  },
  accordionTitle: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  accordionContent: {
      paddingBottom: 15,
      borderTopWidth: 1,
      borderTopColor: '#f3f4f6'
  },
  badge: { backgroundColor: COLORS.primary || 'blue', borderRadius: 10, width: 20, height: 20, justifyContent: 'center', alignItems: 'center' },
  badgeText: { color: 'white', fontSize: 10, fontWeight: 'bold' },

  // Secciones Internas del Filtro
  filterSection: { marginTop: 12 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, marginBottom: 8, gap: 6 },
  sectionLabel: { fontSize: 13, color: '#666', fontWeight: '600', flex: 1 },
  clearFilterText: { fontSize: 11, color: COLORS.primary || 'blue', fontWeight: 'bold' },
  separator: { height: 1, backgroundColor: '#eee', marginVertical: 5, marginHorizontal: 15 },

  // Chips / Tags para ASIGNATURAS (Scroll horizontal)
  chipsScroll: { paddingHorizontal: 15, gap: 8 },

  // Chips / Tags para TEMAS (Wrap / Multi-linea)
  chipsWrapper: { 
      paddingHorizontal: 15, 
      flexDirection: 'row', 
      flexWrap: 'wrap', // <--- ESTO PERMITE LAS 2 FILAS (o más)
      gap: 8 
  },

  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  chipInactive: { backgroundColor: 'white', borderColor: '#ddd' },
  chipActive: { backgroundColor: COLORS.primary || 'blue', borderColor: COLORS.primary || 'blue' },
  chipActiveSub: { backgroundColor: '#4caf50', borderColor: '#4caf50' },

  chipText: { fontSize: 12, fontWeight: '500' },
  chipTextInactive: { color: '#555' },
  chipTextActive: { color: 'white' },

  // --- TABLA Y LISTA ---
  tableHeader: { paddingHorizontal: 20, paddingVertical: 10 },
  tableHeadText: { fontWeight: 'bold', color: '#777', fontSize: 12 },
  
  row: { 
      flexDirection: 'row', 
      backgroundColor: 'white', 
      padding: 15, 
      marginHorizontal: 15, 
      marginBottom: 10, 
      borderRadius: 10, 
      elevation: 1,
      shadowColor: "#000", shadowOffset: {width: 0, height: 1}, shadowOpacity: 0.05, shadowRadius: 1
  },
  infoCol: { flex: 1, marginRight: 10 },
  tagsRow: { flexDirection: 'row', marginBottom: 8, gap: 6, flexWrap: 'wrap' },
  tagContainer: { backgroundColor: '#e3f2fd', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  tagText: { fontSize: 10, color: '#1565c0', fontWeight: '600' },
  statement: { fontSize: 15, color: '#333', lineHeight: 22 },
  
  actionsCol: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconBtn: { padding: 8, backgroundColor: '#f9fafb', borderRadius: 8 },
  
  emptyContainer: { alignItems: 'center', marginTop: 40 },
  empty: { textAlign: 'center', color: 'gray', fontSize: 16 },
});