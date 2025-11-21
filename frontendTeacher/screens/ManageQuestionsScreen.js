import React, { useState, useCallback, useContext, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator, Platform, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';
import { getQuestions, deleteQuestion } from '../api/getRequest';
import { COLORS } from '../constants/colors';
import { Edit, Trash2, FileSpreadsheet, Plus, Filter, X } from 'lucide-react-native';
import QuestionWizardModal from '../components/QuestionWizardModal';

export default function ManageQuestionsScreen({ navigation }) {
  const { isSuper } = useContext(AuthContext);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Estado para el filtro
  const [selectedTopics, setSelectedTopics] = useState([]); // Array de strings

  // Control del Modal
  const [modalVisible, setModalVisible] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const data = await getQuestions();
      console.log("Fetched Questions:", JSON.stringify(data, null, 2));
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

  // --- LÓGICA DE TEMAS ---

  // 1. Función auxiliar para extraer temas de una pregunta (Reutilizada para render y filtro)
  const getTopicsFromItem = (item) => {
    let topicNames = [];
    if (item.topics && Array.isArray(item.topics)) {
        topicNames = item.topics.map(t => t.name || t.title).filter(Boolean);
    } else if (item.topics_titles && Array.isArray(item.topics_titles)) {
        topicNames = item.topics_titles;
    }
    topicNames = [...new Set(topicNames)];
    if (topicNames.length === 0) topicNames = ["General"];
    return topicNames;
  };

  // 2. Obtener lista de TODOS los temas únicos disponibles (useMemo para rendimiento)
  const allUniqueTopics = useMemo(() => {
    const topics = new Set();
    questions.forEach(q => {
        const qTopics = getTopicsFromItem(q);
        qTopics.forEach(t => topics.add(t));
    });
    return Array.from(topics).sort();
  }, [questions]);

  // 3. Filtrar las preguntas basado en la selección
  const filteredQuestions = useMemo(() => {
    if (selectedTopics.length === 0) return questions;
    
    return questions.filter(item => {
        const itemTopics = getTopicsFromItem(item);
        // Si la pregunta tiene AL MENOS UNO de los temas seleccionados
        return itemTopics.some(t => selectedTopics.includes(t));
    });
  }, [questions, selectedTopics]);

  // 4. Manejar clic en un chip de filtro
  const toggleTopicFilter = (topic) => {
    if (selectedTopics.includes(topic)) {
        setSelectedTopics(selectedTopics.filter(t => t !== topic));
    } else {
        setSelectedTopics([...selectedTopics, topic]);
    }
  };

  // --- HANDLERS EXISTENTES ---

  const handleDelete = (id) => {
    Alert.alert(
      "Eliminar Pregunta",
      "¿Estás seguro? Esto borrará también las respuestas asociadas.",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Eliminar", 
          style: "destructive",
          onPress: async () => {
            try {
              await deleteQuestion(id);
              fetchQuestions();
            } catch (e) {
              Alert.alert("Error", "No se pudo eliminar.");
            }
          }
        }
      ]
    );
  };

  const handleEdit = (item) => {
    setEditingQuestion(item);
    setModalVisible(true);
  };

  const handleCreate = () => {
    setEditingQuestion(null);
    setModalVisible(true);
  };

  const handleUploadExcel = () => {
    Alert.alert("Subir Excel", "Funcionalidad para seleccionar archivo .xlsx");
  };

  const renderItem = ({ item }) => {
    const topicNames = getTopicsFromItem(item);
    
    return (
      <View style={styles.row}>
        <View style={styles.infoCol}>
            <View style={styles.tagsRow}>
                {topicNames.map((name, index) => (
                    <View key={index} style={styles.tagContainer}>
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
            
            {isSuper && (
                <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.iconBtn}>
                    <Trash2 size={22} color={COLORS.danger || 'red'} />
                </TouchableOpacity>
            )}
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

      {/* SECCIÓN DE FILTROS (CHIPS) */}
      <View style={styles.filterContainer}>
        <View style={styles.filterHeader}>
            <Filter size={16} color="#666" />
            <Text style={styles.filterLabel}>Filtrar por temas:</Text>
            {selectedTopics.length > 0 && (
                <TouchableOpacity onPress={() => setSelectedTopics([])}>
                    <Text style={styles.clearFilterText}>Limpiar</Text>
                </TouchableOpacity>
            )}
        </View>
        
        <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            contentContainerStyle={styles.chipsScroll}
        >
            {allUniqueTopics.map((topic, index) => {
                const isActive = selectedTopics.includes(topic);
                return (
                    <TouchableOpacity 
                        key={index} 
                        onPress={() => toggleTopicFilter(topic)}
                        style={[
                            styles.chip, 
                            isActive ? styles.chipActive : styles.chipInactive
                        ]}
                    >
                        <Text style={[
                            styles.chipText, 
                            isActive ? styles.chipTextActive : styles.chipTextInactive
                        ]}>
                            {topic}
                        </Text>
                        {isActive && <X size={12} color="white" style={{marginLeft: 4}} />}
                    </TouchableOpacity>
                );
            })}
        </ScrollView>
      </View>

      <View style={styles.tableHeader}>
          <Text style={styles.tableHeadText}>
            {selectedTopics.length > 0 
                ? `Resultados (${filteredQuestions.length})` 
                : `Listado completo (${questions.length})`}
          </Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" style={{marginTop: 20}} />
      ) : (
        <FlatList
          data={filteredQuestions} // USAMOS LA LISTA FILTRADA
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={{ paddingBottom: 20 }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
                <Text style={styles.empty}>No se encontraron preguntas.</Text>
                {selectedTopics.length > 0 && (
                    <Text style={styles.emptySub}>Intenta desactivar algunos filtros.</Text>
                )}
            </View>
          }
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
  container: { flex: 1, backgroundColor: COLORS.background || '#f7f9fa' },
  
  // Header
  topHeader: { 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', 
    padding: 15, backgroundColor: 'white', elevation: 2, zIndex: 10
  },
  screenTitle: { fontSize: 22, fontWeight: 'bold', color: COLORS.text },
  headerButtons: { flexDirection: 'row', gap: 10 },
  excelBtn: { 
    flexDirection: 'row', backgroundColor: '#217346', padding: 8, borderRadius: 6, alignItems: 'center', gap: 5 
  },
  addBtn: { 
    flexDirection: 'row', backgroundColor: COLORS.primary || 'blue', padding: 8, borderRadius: 6, alignItems: 'center', gap: 5 
  },
  btnText: { color: 'white', fontWeight: '600', fontSize: 14 },

  // ESTILOS DEL FILTRO (NUEVO)
  filterContainer: {
    backgroundColor: 'white',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  filterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    marginBottom: 8,
    gap: 6
  },
  filterLabel: { fontSize: 14, color: '#666', fontWeight: '600', flex: 1 },
  clearFilterText: { fontSize: 12, color: COLORS.primary || 'blue', fontWeight: 'bold' },
  chipsScroll: { paddingHorizontal: 15, gap: 8, paddingBottom: 5 },
  
  // Estilo base del Chip
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  // Chip Inactivo (Outline)
  chipInactive: {
    backgroundColor: 'white',
    borderColor: '#ddd',
  },
  // Chip Activo (Relleno)
  chipActive: {
    backgroundColor: COLORS.primary || 'blue',
    borderColor: COLORS.primary || 'blue',
  },
  // Texto del Chip
  chipText: { fontSize: 13, fontWeight: '500' },
  chipTextInactive: { color: '#555' },
  chipTextActive: { color: 'white' },

  // Tabla
  tableHeader: {
      flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 10, backgroundColor: '#eceff1'
  },
  tableHeadText: { fontWeight: 'bold', color: '#546e7a' },

  // Items
  row: { 
      flexDirection: 'row', backgroundColor: 'white', padding: 15, marginHorizontal: 10, marginTop: 10, borderRadius: 8,
      ...Platform.select({
        ios: { shadowColor: "#000", shadowOffset: {width: 0, height: 1}, shadowOpacity: 0.1, shadowRadius: 1 },
        android: { elevation: 1 },
        web: { boxShadow: '0px 1px 3px rgba(0,0,0,0.1)' }
      })
  },
  infoCol: { flex: 1, marginRight: 10 },
  tagsRow: { flexDirection: 'row', marginBottom: 6, gap: 5, flexWrap: 'wrap' },
  tagContainer: { backgroundColor: '#e3f2fd', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4, marginBottom: 2 },
  tagText: { fontSize: 11, color: '#1565c0', fontWeight: '600' },
  statement: { fontSize: 16, color: COLORS.text },
  actionsCol: { flexDirection: 'row', alignItems: 'center', gap: 15 },
  iconBtn: { padding: 5 },
  
  // Empty states
  emptyContainer: { alignItems: 'center', marginTop: 40 },
  empty: { textAlign: 'center', color: 'gray', fontSize: 16 },
  emptySub: { textAlign: 'center', color: '#999', fontSize: 14, marginTop: 5 }
});