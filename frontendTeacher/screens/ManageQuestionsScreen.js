import React, { useState, useCallback, useContext } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator, Platform } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';
import { getQuestions, deleteQuestion } from '../api/getRequest';
import { COLORS } from '../constants/colors';
import { Edit, Trash2, FileSpreadsheet, Plus } from 'lucide-react-native';
import QuestionWizardModal from '../components/QuestionWizardModal';

export default function ManageQuestionsScreen({ navigation }) {
  const { isSuper } = useContext(AuthContext);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  
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
              fetchQuestions(); // Recargar lista
            } catch (e) {
              Alert.alert("Error", "No se pudo eliminar.");
            }
          }
        }
      ]
    );
  };

  const handleEdit = (item) => {
    console.log("Editando pregunta:", item);
    setEditingQuestion(item);
    setModalVisible(true);
  };

  const handleCreate = () => {
    setEditingQuestion(null);
    setModalVisible(true);
  };

  const handleUploadExcel = () => {
    Alert.alert(
        "Subir Excel", 
        "Funcionalidad para seleccionar archivo .xlsx y enviarlo al backend. (Requiere librería externa document-picker)"
    );
  };

  const renderItem = ({ item }) => {
    // 1. Obtener nombres de temas
    let topicNames = [];

    // Prioridad: item.topics (array de objetos del backend)
    if (item.topics && Array.isArray(item.topics)) {
        // Mapeamos usando 'name' (según tu log JSON) o 'title' como fallback
        topicNames = item.topics.map(t => t.name || t.title).filter(Boolean);
    } 
    // Fallback: item.topics_titles (si tu API lo envía plano)
    else if (item.topics_titles && Array.isArray(item.topics_titles)) {
        topicNames = item.topics_titles;
    }

    // 2. Eliminar duplicados (Set) y asegurar que haya al menos "General"
    topicNames = [...new Set(topicNames)];
    if (topicNames.length === 0) topicNames = ["General"];
    
    return (
      <View style={styles.row}>
        <View style={styles.infoCol}>
            {/* Mapeamos cada tema a una etiqueta visual */}
            <View style={styles.tagsRow}>
                {topicNames.map((name, index) => (
                    <View key={index} style={styles.tagContainer}>
                        <Text style={styles.tagText}>{name}</Text>
                    </View>
                ))}
            </View>
            {/* Usamos statement_es si existe (backend), o statement como fallback */}
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

      <View style={styles.tableHeader}>
          <Text style={styles.tableHeadText}>Temas / Enunciado</Text>
          <Text style={styles.tableHeadText}>Acciones</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" style={{marginTop: 20}} />
      ) : (
        <FlatList
          data={questions}
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={{ paddingBottom: 20 }}
          ListEmptyComponent={<Text style={styles.empty}>No hay preguntas registradas.</Text>}
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
  topHeader: { 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', 
    padding: 15, backgroundColor: 'white', elevation: 2 
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
  
  tableHeader: {
      flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 10, backgroundColor: '#eceff1'
  },
  tableHeadText: { fontWeight: 'bold', color: '#546e7a' },

  row: { 
      flexDirection: 'row', backgroundColor: 'white', padding: 15, marginHorizontal: 10, marginTop: 10, borderRadius: 8,
      // CORRECCIÓN: Usar Platform.select para evitar advertencias en Web
      ...Platform.select({
        ios: {
            shadowColor: "#000", 
            shadowOffset: {width: 0, height: 1}, 
            shadowOpacity: 0.1,
            shadowRadius: 1, // Corregido shadowRadius
        },
        android: {
            elevation: 1,
        },
        web: {
            boxShadow: '0px 1px 3px rgba(0,0,0,0.1)', // Sombra estándar para web
        }
      })
  },
  infoCol: { flex: 1, marginRight: 10 },
  
  tagsRow: { 
      flexDirection: 'row', 
      marginBottom: 6, 
      gap: 5, 
      flexWrap: 'wrap' 
  },
  tagContainer: { 
      backgroundColor: '#e3f2fd', 
      paddingHorizontal: 8, 
      paddingVertical: 3, 
      borderRadius: 4,
      marginBottom: 2 
  },
  tagText: { fontSize: 11, color: '#1565c0', fontWeight: '600' },
  
  statement: { fontSize: 16, color: COLORS.text },
  actionsCol: { flexDirection: 'row', alignItems: 'center', gap: 15 },
  iconBtn: { padding: 5 },
  empty: { textAlign: 'center', marginTop: 30, color: 'gray' }
});