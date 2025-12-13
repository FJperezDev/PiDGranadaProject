import React, { useState, useContext, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, RefreshControl, Platform } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { 
  getSubjects 
} from '../api/coursesRequests';
import {
  getTopics, createTopic, updateTopic, deleteTopic, 
  getAllConcepts, createConcept, updateConcept, deleteConcept,
  linkConceptToConcept, unlinkConceptFromConcept, subjectIsAboutTopic, subjectIsNotAboutTopic,
  topicIsAboutConcept, topicIsNotAboutConcept
} from '../api/contentRequests';
import { TopicModal, ConceptModal } from '../components/ContentModals';
import { BookOpen, Lightbulb, PlusCircle, Trash2, Edit, ChevronRight } from 'lucide-react-native';
import { COLORS } from '../constants/colors';

export default function ManageContentScreen({ navigation }) {
  
  // Datos
  const [topics, setTopics] = useState([]);
  const [concepts, setConcepts] = useState([]);
  const [allSubjects, setAllSubjects] = useState([]); // Para el modal de Topics

  // Estado UI
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('topics'); // 'topics' | 'concepts'
  
  // Estado Modales
  const [topicModalVisible, setTopicModalVisible] = useState(false);
  const [conceptModalVisible, setConceptModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tData, cData, sData] = await Promise.all([
        getTopics(), 
        getAllConcepts(),
        getSubjects()
      ]);
      setTopics(tData);
      setConcepts(cData);
      setAllSubjects(sData);
    } catch (error) {
      Alert.alert('Error', 'No se pudo cargar el contenido');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchData(); }, []));

  // --- HANDLERS TEMAS ---
  const handleSaveTopic = async (data, originalSubjectIds = [], originalConceptIds = []) => {
    setLoading(true);
    try {
      // 1. Preparar datos
      const currentSubjectIds = data.subject_ids || [];
      const currentConceptIds = data.concept_ids || [];

      // Limpiamos el objeto para crear/editar el Tema (API no espera arrays de IDs en el body del topic)
      const dataToSave = { ...data };
      delete dataToSave.subject_ids;
      delete dataToSave.concept_ids;

      let topicId;
      let topicName = data.title_es; // Necesario para las relaciones de Asignatura

      // 2. Guardar o Actualizar el TEMA
      if (editingItem) {
        await updateTopic(editingItem.id, dataToSave);
        topicId = editingItem.id;
        topicName = dataToSave.title_es; // Actualizamos por si cambió el nombre
      } else {
        const newTopic = await createTopic(dataToSave);
        topicId = newTopic.id;
        topicName = newTopic.title_es;
      }

      // ---------------------------------------------------------
      // 3. GESTIÓN DE ASIGNATURAS (Subjects)
      // ---------------------------------------------------------
      
      // A. Quitar (Estaban antes, ahora no)
      const subjectsToUnlink = originalSubjectIds.filter(id => !currentSubjectIds.includes(id));
      // B. Añadir (No estaban antes, ahora sí)
      const subjectsToLink = currentSubjectIds.filter(id => !originalSubjectIds.includes(id));

      const subjectUnlinkPromises = subjectsToUnlink.map(subId => {
        // OJO: La API pide (subjectId, topicName)
        return subjectIsNotAboutTopic(subId, topicName);
      });

      const subjectLinkPromises = subjectsToLink.map(subId => {
        // OJO: La API pide (subjectId, topicName)
        return subjectIsAboutTopic(subId, topicName);
      });

      // ---------------------------------------------------------
      // 4. GESTIÓN DE CONCEPTOS (Concepts)
      // ---------------------------------------------------------

      // A. Quitar
      const conceptsToUnlink = originalConceptIds.filter(id => !currentConceptIds.includes(id));
      // B. Añadir
      const conceptsToLink = currentConceptIds.filter(id => !originalConceptIds.includes(id));

      // Helper para obtener nombre del concepto
      const getConceptNameById = (id) => {
        const found = concepts.find(c => c.id === id);
        return found ? (found.name_es || found.name) : null;
      };

      const conceptUnlinkPromises = conceptsToUnlink.map(cId => {
        const cName = getConceptNameById(cId);
        if (cName) return topicIsNotAboutConcept(topicId, cName);
        return Promise.resolve();
      });

      const conceptLinkPromises = conceptsToLink.map(cId => {
        const cName = getConceptNameById(cId);
        if (cName) return topicIsAboutConcept(topicId, cName);
        return Promise.resolve();
      });

      // 5. Ejecutar TODO junto
      await Promise.all([
        ...subjectUnlinkPromises,
        ...subjectLinkPromises,
        ...conceptUnlinkPromises,
        ...conceptLinkPromises
      ]);

      setTopicModalVisible(false);
      setEditingItem(null);
      fetchData();
      Alert.alert('Éxito', 'Tema guardado correctamente');

    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Falló al guardar el tema o sus relaciones');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTopic = (orderId) => {
      // Definimos la lógica de borrado para reutilizarla
      const performDelete = async () => {
        try {
          await deleteTopic(orderId);
          fetchData();
        } catch (error) {
          console.error("Error al eliminar", error);
        }
      };
  
      if (Platform.OS === 'web') {
        // Lógica para Navegador (usa el confirm nativo del browser)
        if (window.confirm('Eliminar: ¿Seguro que quieres eliminar este tema?')) {
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

  // --- HANDLERS CONCEPTOS ---
  const handleSaveConcept = async (data, originalIdsFromModal = []) => {
    setLoading(true);
    try {
      const incomingRelations = data.related_concepts || [];
      const incomingIds = incomingRelations.map(r => r.id);
  
      const dataToSave = { ...data };
      delete dataToSave.related_concepts;
      delete dataToSave.related_concept_ids;
  
      let parentConceptId;
  
      if (editingItem) {
        await updateConcept(editingItem.id, dataToSave);
        parentConceptId = editingItem.id;
      } else {
        const newConcept = await createConcept(dataToSave);
        parentConceptId = newConcept.id;
      }

      const idsToUnlink = originalIdsFromModal.filter(id => !incomingIds.includes(id));
      const unlinkPromises = idsToUnlink.map(childId => unlinkConceptFromConcept(parentConceptId, childId));
  
      const linkPromises = incomingRelations.map(relation => {
        return linkConceptToConcept(
            parentConceptId, 
            relation.id, 
            relation.description_es,
            relation.description_en,
        );
      });
  
      await Promise.all([...unlinkPromises, ...linkPromises]);
  
      setConceptModalVisible(false);
      setEditingItem(null);
      fetchData(); 
      Alert.alert('Éxito', 'Concepto y relaciones guardados correctamente');
  
    } catch (e) { 
      console.error(e);
      Alert.alert('Error', 'Ocurrió un error al guardar'); 
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConcept = (conceptId) => {
      // Definimos la lógica de borrado para reutilizarla
      const performDelete = async () => {
        try {
          await deleteConcept(conceptId);
          fetchData();
        } catch (error) {
          console.error("Error al eliminar", error);
        }
      };
  
      if (Platform.OS === 'web') {
        // Lógica para Navegador (usa el confirm nativo del browser)
        if (window.confirm('Eliminar: ¿Seguro que quieres eliminar este concepto?')) {
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

  // --- ABRIR MODALES ---
  const openCreateModal = () => {
    setEditingItem(null);
    if (activeTab === 'topics') setTopicModalVisible(true);
    else setConceptModalVisible(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    if (activeTab === 'topics') setTopicModalVisible(true);
    else setConceptModalVisible(true);
  };

  // --- RENDERS ---
  const renderTopicItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.card} 
      onPress={() => navigation.navigate('TopicDetail', { topic: item })} // Navega a Epígrafes
    >
      <View style={styles.cardContent}>
        <BookOpen size={24} color={COLORS.primary} />
        <View style={styles.textContainer}>
          <Text style={styles.cardTitle}>{item.title || item.title_es}</Text>
          <Text style={styles.cardSub} numberOfLines={1}>{item.description || item.description_es}</Text>
        </View>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity onPress={() => openEditModal(item)} style={styles.iconBtn}>
          <Edit size={20} color={COLORS.secondary} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDeleteTopic(item.id)} style={styles.iconBtn}>
          <Trash2 size={20} color={COLORS.danger || 'red'} />
        </TouchableOpacity>
        <ChevronRight size={20} color="gray" />
      </View>
    </TouchableOpacity>
  );

  const renderConceptItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardContent}>
        <Lightbulb size={24} color="#fbc02d" />
        <View style={styles.textContainer}>
          <Text style={styles.cardTitle}>{item.name || item.name_es}</Text>
          {item.related_concepts && item.related_concepts.length > 0 && (
             <Text style={styles.cardSub}>Relacionado con: {item.related_concepts.length}</Text>
          )}
        </View>
      </View>
      <TouchableOpacity onPress={() => openEditModal(item)} style={styles.iconBtn}>
        <Edit size={20} color={COLORS.secondary} />
      </TouchableOpacity>
      <View style={styles.actions}>
        <TouchableOpacity onPress={() => handleDeleteConcept(item.id)} style={styles.iconBtn}>
          <Trash2 size={20} color={COLORS.danger || 'red'} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header con Título y Botón Crear */}
      <View style={styles.header}>
        <Text style={styles.title}>Contenido Académico</Text>
        <TouchableOpacity onPress={openCreateModal}>
          <PlusCircle size={30} color={COLORS.secondary || 'blue'} />
        </TouchableOpacity>
      </View>

      {/* Pestañas (Tabs) */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'topics' && styles.activeTab]} 
          onPress={() => setActiveTab('topics')}
        >
          <Text style={[styles.tabText, activeTab === 'topics' && styles.activeTabText]}>Temas</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'concepts' && styles.activeTab]} 
          onPress={() => setActiveTab('concepts')}
        >
          <Text style={[styles.tabText, activeTab === 'concepts' && styles.activeTabText]}>Conceptos</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={activeTab === 'topics' ? topics : concepts}
          renderItem={activeTab === 'topics' ? renderTopicItem : renderConceptItem}
          keyExtractor={item => item.id.toString()}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchData} />}
          ListEmptyComponent={<Text style={styles.empty}>No hay {activeTab === 'topics' ? 'temas' : 'conceptos'} creados.</Text>}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}

      {/* Modales */}
      <TopicModal 
        visible={topicModalVisible} 
        onClose={() => setTopicModalVisible(false)} 
        onSubmit={handleSaveTopic} 
        editingTopic={editingItem}
        allSubjects={allSubjects}
        allConcepts={concepts} // Pasamos todos los conceptos para poder vincularlos al Tema
      />

      <ConceptModal 
        visible={conceptModalVisible} 
        onClose={() => setConceptModalVisible(false)} 
        onSubmit={handleSaveConcept} 
        editingConcept={editingItem}
        allConcepts={concepts} // Pasamos los conceptos para vincular entre sí
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: COLORS.background || '#f7f9fa' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  title: { fontSize: 24, fontWeight: 'bold', color: COLORS.text },
  
  tabsContainer: { flexDirection: 'row', marginBottom: 15, backgroundColor: '#e0e0e0', borderRadius: 8, padding: 2 },
  tab: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 6 },
  activeTab: { backgroundColor: 'white', elevation: 2 },
  tabText: { fontWeight: '600', color: 'gray' },
  activeTabText: { color: COLORS.primary },

  card: { backgroundColor: 'white', padding: 15, borderRadius: 10, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', elevation: 2 },
  cardContent: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  textContainer: { marginLeft: 15, flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: COLORS.text },
  cardSub: { fontSize: 12, color: 'gray', marginTop: 2 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconBtn: { padding: 5 },
  empty: { textAlign: 'center', marginTop: 30, color: 'gray' }
});