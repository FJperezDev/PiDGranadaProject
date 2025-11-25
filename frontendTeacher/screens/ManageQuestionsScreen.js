import React, { useState, useCallback, useContext, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator, Platform, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';
import { getQuestions, deleteQuestion } from '../api/evaluationRequests';
import { COLORS } from '../constants/colors';
import { Edit, Trash2, FileSpreadsheet, Plus, Filter, X, Book } from 'lucide-react-native'; // Book icon para Subjects
import QuestionWizardModal from '../components/QuestionWizardModal';

export default function ManageQuestionsScreen({ navigation }) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // --- ESTADOS PARA FILTROS ---
  const [selectedTopics, setSelectedTopics] = useState([]); // Strings
  const [selectedSubjects, setSelectedSubjects] = useState([]); // Strings (NUEVO)

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

  // --- HELPERS PARA EXTRAER DATOS ---

  // 1. Extraer Temas (Topics)
  const getTopicsFromItem = (item) => {
    let topicNames = [];
    if (item.topics && Array.isArray(item.topics)) {
        topicNames = item.topics.map(t => t.name || t.title).filter(Boolean);
    } else if (item.topics_titles && Array.isArray(item.topics_titles)) {
        topicNames = item.topics_titles;
    }
    // Si está vacío, podríamos devolver "General" o dejarlo vacío
    return [...new Set(topicNames)];
  };

  // 2. Extraer Asignaturas (Subjects) -- NUEVO
  const getSubjectsFromItem = (item) => {
    let subjectNames = [];
    if (item.subjects && Array.isArray(item.subjects)) {
        subjectNames = item.subjects.map(s => s.name).filter(Boolean);
    }
    // Si tu backend no devuelve 'subjects' directamente, pero los temas tienen subject:
    // if (item.topics) item.topics.forEach(t => if(t.subject) subjectNames.push(t.subject.name))
    
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

        // Filtro de Temas (OR logic: Si tiene alguno de los seleccionados)
        const matchesTopic = selectedTopics.length === 0 || itemTopics.some(t => selectedTopics.includes(t));
        
        // Filtro de Asignaturas (OR logic: Si pertenece a alguna de las seleccionadas)
        const matchesSubject = selectedSubjects.length === 0 || itemSubjects.some(s => selectedSubjects.includes(s));

        // AND logic: Debe cumplir filtro de tema Y filtro de asignatura
        return matchesTopic && matchesSubject;
    });
  }, [questions, selectedTopics, selectedSubjects]);

  // --- HANDLERS DE FILTROS ---
  const toggleTopicFilter = (topic) => {
    setSelectedTopics(prev => prev.includes(topic) ? prev.filter(t => t !== topic) : [...prev, topic]);
  };

  const toggleSubjectFilter = (subject) => {
    setSelectedSubjects(prev => prev.includes(subject) ? prev.filter(s => s !== subject) : [...prev, subject]);
  };

  // ... (Handlers handleEdit, handleDelete, etc. IGUALES QUE ANTES) ...

  const handleDelete = (id) => {
    // Definimos la lógica de borrado para reutilizarla
    const performDelete = async () => {
      try {
        await deleteQuestion(id);
        fetchQuestions();
      } catch (error) {
        console.error("Error al eliminar", error);
      }
    };

    if (Platform.OS === 'web') {
      // Lógica para Navegador (usa el confirm nativo del browser)
      if (window.confirm('Eliminar: ¿Seguro que quieres eliminar esta pregunta?')) {
        performDelete();
      }
    } else {
      // Lógica para Móvil (iOS/Android)
      Alert.alert('Eliminar', '¿Seguro?', [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Eliminar', 
          style: 'destructive', 
          onPress: performDelete 
        }
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
            {/* Renderizar Tags de Asignatura (Arriba o junto a temas) */}
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

      {/* --- FILTROS --- */}
      <View style={styles.filterContainer}>
        
        {/* FILTRO ASIGNATURAS */}
        <View style={styles.filterSection}>
            <View style={styles.filterHeader}>
                <Book size={14} color="#666" />
                <Text style={styles.filterLabel}>Asignaturas:</Text>
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

        {/* SEPARADOR */}
        <View style={{height: 1, backgroundColor: '#eee', marginVertical: 5}} />

        {/* FILTRO TEMAS */}
        <View style={styles.filterSection}>
            <View style={styles.filterHeader}>
                <Filter size={14} color="#666" />
                <Text style={styles.filterLabel}>Temas:</Text>
                {selectedTopics.length > 0 && (
                    <TouchableOpacity onPress={() => setSelectedTopics([])}><Text style={styles.clearFilterText}>Limpiar</Text></TouchableOpacity>
                )}
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsScroll}>
                {allUniqueTopics.map((topic, index) => {
                    const isActive = selectedTopics.includes(topic);
                    return (
                        <TouchableOpacity key={index} onPress={() => toggleTopicFilter(topic)} style={[styles.chip, isActive ? styles.chipActive : styles.chipInactive]}>
                            <Text style={[styles.chipText, isActive ? styles.chipTextActive : styles.chipTextInactive]}>{topic}</Text>
                            {isActive && <X size={12} color="white" style={{marginLeft: 4}} />}
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>

      </View>

      {/* LISTA Y RESTO */}
      <View style={styles.tableHeader}>
          <Text style={styles.tableHeadText}>
            {filteredQuestions.length} Resultados
          </Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" style={{marginTop: 20}} />
      ) : (
        <FlatList
          data={filteredQuestions}
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={{ paddingBottom: 20 }}
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
  // ... (Estilos anteriores) ...
  container: { flex: 1, backgroundColor: COLORS.background || '#f7f9fa' },
  topHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, backgroundColor: 'white', elevation: 2, zIndex: 10 },
  screenTitle: { fontSize: 22, fontWeight: 'bold', color: COLORS.text },
  headerButtons: { flexDirection: 'row', gap: 10 },
  excelBtn: { flexDirection: 'row', backgroundColor: '#217346', padding: 8, borderRadius: 6, alignItems: 'center', gap: 5 },
  addBtn: { flexDirection: 'row', backgroundColor: COLORS.primary || 'blue', padding: 8, borderRadius: 6, alignItems: 'center', gap: 5 },
  btnText: { color: 'white', fontWeight: '600', fontSize: 14 },

  // FILTROS ESTILOS ACTUALIZADOS
  filterContainer: { backgroundColor: 'white', paddingVertical: 5, borderBottomWidth: 1, borderBottomColor: '#eee' },
  filterSection: { marginVertical: 4 },
  filterHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, marginBottom: 5, gap: 6 },
  filterLabel: { fontSize: 13, color: '#666', fontWeight: '600', flex: 1 },
  clearFilterText: { fontSize: 11, color: COLORS.primary || 'blue', fontWeight: 'bold' },
  chipsScroll: { paddingHorizontal: 15, gap: 8, paddingBottom: 5 },
  
  chip: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20, borderWidth: 1, flexDirection: 'row', alignItems: 'center' },
  chipInactive: { backgroundColor: 'white', borderColor: '#ddd' },
  chipActive: { backgroundColor: COLORS.primary || 'blue', borderColor: COLORS.primary || 'blue' },
  chipActiveSub: { backgroundColor: '#4caf50', borderColor: '#4caf50' }, // Color distinto para Subjects

  chipText: { fontSize: 12, fontWeight: '500' },
  chipTextInactive: { color: '#555' },
  chipTextActive: { color: 'white' },

  // Tabla Items
  tableHeader: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 8, backgroundColor: '#eceff1' },
  tableHeadText: { fontWeight: 'bold', color: '#546e7a', fontSize: 12 },
  row: { flexDirection: 'row', backgroundColor: 'white', padding: 15, marginHorizontal: 10, marginTop: 10, borderRadius: 8, ...Platform.select({ ios: { shadowColor: "#000", shadowOffset: {width: 0, height: 1}, shadowOpacity: 0.1, shadowRadius: 1 }, android: { elevation: 1 }, web: { boxShadow: '0px 1px 3px rgba(0,0,0,0.1)' } }) },
  infoCol: { flex: 1, marginRight: 10 },
  tagsRow: { flexDirection: 'row', marginBottom: 6, gap: 5, flexWrap: 'wrap' },
  tagContainer: { backgroundColor: '#e3f2fd', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4, marginBottom: 2 },
  tagText: { fontSize: 10, color: '#1565c0', fontWeight: '600' },
  statement: { fontSize: 15, color: COLORS.text },
  actionsCol: { flexDirection: 'row', alignItems: 'center', gap: 15 },
  iconBtn: { padding: 5 },
  emptyContainer: { alignItems: 'center', marginTop: 40 },
  empty: { textAlign: 'center', color: 'gray', fontSize: 16 },
});