import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, RefreshControl, Platform } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getSubjects } from '../api/coursesRequests';
import {
  getTopics, createTopic, updateTopic, deleteTopic, 
  getAllConcepts, createConcept, updateConcept, deleteConcept,
  linkConceptToConcept, unlinkConceptFromConcept, subjectIsAboutTopic, subjectIsNotAboutTopic,
  topicIsAboutConcept, topicIsNotAboutConcept
} from '../api/contentRequests';
import { TopicModal, ConceptModal } from '../components/ContentModals';
import { BookOpen, Lightbulb, Plus, Trash2, Edit, ChevronRight } from 'lucide-react-native';
import { COLORS } from '../constants/colors';
import { useLanguage } from '../context/LanguageContext';
import { StyledButton } from '../components/StyledButton';

export default function ManageContentScreen({ navigation }) {
  const { t, language } = useLanguage();
  const [topics, setTopics] = useState([]);
  const [concepts, setConcepts] = useState([]);
  const [allSubjects, setAllSubjects] = useState([]);

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('topics'); 
  
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
      Alert.alert(t('error'), t('error') + ": No se pudieron cargar los datos.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [language]);
  useFocusEffect(useCallback(() => { fetchData(); }, []));

  // --- HANDLERS TEMAS (TOPICS) ---
  const handleSaveTopic = async (data, originalSubjectIds = [], originalConceptIds = []) => {
    setLoading(true);
    try {
      // 1. Separar datos del formulario
      const currentSubjectIds = data.subject_ids || [];
      const currentConceptIds = data.concept_ids || [];

      // 2. Preparar payload limpio (solo campos del modelo Topic)
      const dataToSave = {
          title_es: data.title_es,
          title_en: data.title_en,
          description_es: data.description_es,
          description_en: data.description_en,
          // No enviamos subject_ids ni concept_ids aquí, eso va por endpoints separados
      };

      let topicId;
      let savedTopicTitle; // Importante: Usaremos el título real devuelto por el servidor

      // 3. Crear o Actualizar el Topic
      if (editingItem) {
        const updated = await updateTopic(editingItem.id, dataToSave);
        topicId = editingItem.id;
        savedTopicTitle = updated.title_es || updated.title;
      } else {
        const newTopic = await createTopic(dataToSave);
        topicId = newTopic.id;
        savedTopicTitle = newTopic.title_es || newTopic.title;
      }

      // 4. Gestionar ASIGNATURAS (Subjects)
      // Calculamos diferencias
      const subjectsToUnlink = originalSubjectIds.filter(id => !currentSubjectIds.includes(id));
      const subjectsToLink = currentSubjectIds.filter(id => !originalSubjectIds.includes(id));

      const subjectPromises = [
          ...subjectsToUnlink.map(subId => subjectIsNotAboutTopic(subId, savedTopicTitle)),
          ...subjectsToLink.map(subId => subjectIsAboutTopic(subId, savedTopicTitle))
      ];

      // 5. Gestionar CONCEPTOS (Concepts)
      const conceptsToUnlink = originalConceptIds.filter(id => !currentConceptIds.includes(id));
      const conceptsToLink = currentConceptIds.filter(id => !originalConceptIds.includes(id));

      // Helper para buscar el nombre del concepto (necesario para el backend actual de Topic)
      const getConceptNameById = (id) => {
        const found = concepts.find(c => c.id === id);
        return found ? (found.name_es || found.name) : null;
      };

      const conceptPromises = [
          ...conceptsToUnlink.map(cId => {
              const name = getConceptNameById(cId);
              return name ? topicIsNotAboutConcept(topicId, name, cId) : Promise.resolve();
          }),
          ...conceptsToLink.map(cId => {
              const name = getConceptNameById(cId);
              return name ? topicIsAboutConcept(topicId, name) : Promise.resolve();
          })
      ];
      
      // Ejecutar todas las vinculaciones en paralelo
      await Promise.all([...subjectPromises, ...conceptPromises]);

      setTopicModalVisible(false);
      setEditingItem(null);
      Alert.alert(t('success'), t('success'));
      fetchData(); // Recargar lista completa

    } catch (e) {
      console.error("Error saving topic:", e);
      const msg = e.response?.data?.detail || e.message || t('error');
      Alert.alert(t('error'), msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTopic = (orderId) => {
      const performDelete = async () => {
        try {
          setLoading(true);
          await deleteTopic(orderId);
          fetchData();
        } catch (error) {
          console.error("Error al eliminar", error);
          Alert.alert(t('error'), "No se pudo eliminar el tema.");
          setLoading(false);
        }
      };
  
      if (Platform.OS === 'web') {
        if (window.confirm(t('deleteGroupConfirm'))) performDelete();
      } else {
        Alert.alert(t('delete'), t('deleteGroupConfirm'), [
          { text: t('cancel'), style: 'cancel' },
          { text: t('delete'), style: 'destructive', onPress: performDelete }
        ]);
      }
  };

  // --- HANDLERS CONCEPTOS (CONCEPTS) ---
  const handleSaveConcept = async (data, originalIdsFromModal = []) => {
    setLoading(true);
    try {
      const incomingRelations = data.related_concepts || [];
      const incomingIds = incomingRelations.map(r => r.id);
  
      const dataToSave = {
          name_es: data.name_es,
          name_en: data.name_en,
          description_es: data.description_es,
          description_en: data.description_en,
          // No enviamos related_concepts aquí
      };
  
      let parentConceptId;
  
      if (editingItem) {
        await updateConcept(editingItem.id, dataToSave);
        parentConceptId = editingItem.id;
      } else {
        const newConcept = await createConcept(dataToSave);
        parentConceptId = newConcept.id;
      }

      // 1. Desvincular eliminados
      const idsToUnlink = originalIdsFromModal.filter(id => !incomingIds.includes(id));
      const unlinkPromises = idsToUnlink.map(childId => unlinkConceptFromConcept(parentConceptId, childId));
  
      // 2. Vincular nuevos o actualizar descripciones
      // Nota: Si ya existía pero cambió la descripción, el backend debería manejarlo (upsert) o podríamos desvincular y revincular.
      // Asumiremos que linkConceptToConcept actualiza si ya existe.
      
      const linkPromises = incomingRelations.map(relation => {
        return linkConceptToConcept(
            parentConceptId, 
            relation.id, 
            relation.description_es || '',
            relation.description_en || '',
        );
      });
  
      await Promise.all([...unlinkPromises, ...linkPromises]);
  
      setConceptModalVisible(false);
      setEditingItem(null);
      Alert.alert(t('success'), t('success'));
      fetchData(); 
  
    } catch (e) { 
      console.error(e);
      const msg = e.response?.data?.detail || e.message || t('error');
      Alert.alert(t('error'), msg); 
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConcept = (conceptId) => {
      const performDelete = async () => {
        try {
          setLoading(true);
          await deleteConcept(conceptId);
          fetchData();
        } catch (error) {
          console.error("Error al eliminar", error);
          Alert.alert(t('error'), "No se pudo eliminar el concepto.");
          setLoading(false);
        }
      };
  
      if (Platform.OS === 'web') {
        if (window.confirm(t('deleteGroupConfirm'))) performDelete();
      } else {
        Alert.alert(t('delete'), t('deleteGroupConfirm'), [
          { text: t('cancel'), style: 'cancel' },
          { text: t('delete'), style: 'destructive', onPress: performDelete }
        ]);
      }
  };

  const openCreateModal = () => {
    setEditingItem(null);
    activeTab === 'topics' ? setTopicModalVisible(true) : setConceptModalVisible(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    activeTab === 'topics' ? setTopicModalVisible(true) : setConceptModalVisible(true);
  };

  // --- RENDER ITEMS ---
  const renderTopicItem = ({ item }) => (
    <StyledButton 
      variant="secondary"
      style={styles.card} 
      onPress={() => navigation.navigate('TopicDetail', { topic: item })}
    >
      <View style={styles.cardInner}>
        <View style={styles.cardIconBox}>
            <BookOpen size={24} color={COLORS.primary} />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.cardTitle}>{item.title || item.title_es}</Text>
          <Text style={styles.cardSub} numberOfLines={1}>{item.description || item.description_es}</Text>
        </View>
        
        <View style={styles.actions}>
            <StyledButton onPress={() => openEditModal(item)} variant="ghost" size="small" style={styles.iconBtn}>
                <Edit size={20} color={COLORS.textSecondary} />
            </StyledButton>
            <StyledButton onPress={() => handleDeleteTopic(item.id)} variant="ghost" size="small" style={styles.iconBtn}>
                <Trash2 size={20} color={COLORS.danger} />
            </StyledButton>
            <ChevronRight size={20} color={COLORS.border} />
        </View>
      </View>
    </StyledButton>
  );

  const renderConceptItem = ({ item }) => (
    <View style={styles.cardStatic}>
        <View style={[styles.cardIconBox, {backgroundColor: '#FFF9C4'}]}>
            <Lightbulb size={24} color="#FBC02D" />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.cardTitle}>{item.name || item.name_es}</Text>
          {item.related_concepts && item.related_concepts.length > 0 && (
             <Text style={styles.cardSub}>{t('relatedTo')}: {item.related_concepts.length}</Text>
          )}
        </View>
        
        <View style={styles.actions}>
            <StyledButton onPress={() => openEditModal(item)} variant="ghost" size="small" style={styles.iconBtn}>
                <Edit size={20} color={COLORS.textSecondary} />
            </StyledButton>
            <StyledButton onPress={() => handleDeleteConcept(item.id)} variant="ghost" size="small" style={styles.iconBtn}>
                <Trash2 size={20} color={COLORS.danger} />
            </StyledButton>
        </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('academicContent')}</Text>
        <StyledButton 
            onPress={openCreateModal} 
            icon={<Plus size={20} color={COLORS.white} />}
            style={styles.fab}
            title={t('create')}
        />
      </View>

      <View style={styles.tabsContainer}>
        <StyledButton 
          onPress={() => setActiveTab('topics')}
          variant={activeTab === 'topics' ? 'primary' : 'ghost'}
          style={styles.tab}
          textStyle={activeTab !== 'topics' && {color: COLORS.textSecondary}}
          title={t('topics')}
        />
        <StyledButton 
          onPress={() => setActiveTab('concepts')}
          variant={activeTab === 'concepts' ? 'primary' : 'ghost'}
          style={styles.tab}
          textStyle={activeTab !== 'concepts' && {color: COLORS.textSecondary}}
          title={t('concepts')}
        />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={activeTab === 'topics' ? topics : concepts}
          renderItem={activeTab === 'topics' ? renderTopicItem : renderConceptItem}
          keyExtractor={item => item.id.toString()}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchData} />}
          ListEmptyComponent={<Text style={styles.empty}>{t('noContent')}</Text>}
          contentContainerStyle={{ paddingBottom: 80, gap: 10 }}
        />
      )}

      {/* MODALES */}
      <TopicModal 
        visible={topicModalVisible} 
        onClose={() => setTopicModalVisible(false)} 
        onSubmit={handleSaveTopic} 
        editingTopic={editingItem} 
        allSubjects={allSubjects} 
        allConcepts={concepts} 
      />
      <ConceptModal 
        visible={conceptModalVisible} 
        onClose={() => setConceptModalVisible(false)} 
        onSubmit={handleSaveConcept} 
        editingConcept={editingItem} 
        allConcepts={concepts} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 26, fontWeight: '800', color: COLORS.text },
  fab: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20 },
  
  tabsContainer: { flexDirection: 'row', marginBottom: 20, backgroundColor: COLORS.surface, borderRadius: 12, padding: 4, borderWidth: 1, borderColor: COLORS.borderLight },
  tab: { flex: 1, borderRadius: 8, paddingVertical: 8 },

  // Estilo para el StyledButton (Touchable)
  card: { 
      marginBottom: 0, 
      paddingHorizontal: 0, paddingVertical: 0, 
      justifyContent: 'center',
      alignItems: 'stretch'
  },
  // Estilo para el View estático (Conceptos)
  cardStatic: {
      backgroundColor: COLORS.surface,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: COLORS.borderLight,
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      elevation: 2,
      shadowColor: COLORS.shadow, shadowOffset: {width:0, height:2}, shadowOpacity:0.05, shadowRadius:3
  },
  // Contenido interno del botón
  cardInner: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      width: '100%'
  },
  cardIconBox: {
      width: 48, height: 48, borderRadius: 12,
      backgroundColor: COLORS.primaryVeryLight,
      justifyContent: 'center', alignItems: 'center',
      marginRight: 16
  },
  textContainer: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text, marginBottom: 2 },
  cardSub: { fontSize: 13, color: COLORS.textSecondary },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  iconBtn: { paddingHorizontal: 8, paddingVertical: 8, width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
  empty: { textAlign: 'center', marginTop: 40, color: COLORS.textSecondary, fontSize: 16 }
});