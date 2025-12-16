import React, { useState, useContext, useCallback, useEffect } from 'react';
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
import { BookOpen, Lightbulb, PlusCircle, Trash2, Edit, ChevronRight } from 'lucide-react-native';
import { COLORS } from '../constants/colors';
import { useLanguage } from '../context/LanguageContext';

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
      Alert.alert(t('error'), t('error'));
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [language]);

  useFocusEffect(useCallback(() => { fetchData(); }, []));

  // --- HANDLERS TEMAS ---
  const handleSaveTopic = async (data, originalSubjectIds = [], originalConceptIds = []) => {
    setLoading(true);
    try {
      const currentSubjectIds = data.subject_ids || [];
      const currentConceptIds = data.concept_ids || [];

      const dataToSave = { ...data };
      delete dataToSave.subject_ids;
      delete dataToSave.concept_ids;

      let topicId;
      let topicName = data.title_es; 

      if (editingItem) {
        await updateTopic(editingItem.id, dataToSave);
        topicId = editingItem.id;
        topicName = dataToSave.title_es; 
      } else {
        const newTopic = await createTopic(dataToSave);
        topicId = newTopic.id;
        topicName = newTopic.title_es;
      }

      // Subjects
      const subjectsToUnlink = originalSubjectIds.filter(id => !currentSubjectIds.includes(id));
      const subjectsToLink = currentSubjectIds.filter(id => !originalSubjectIds.includes(id));

      const subjectUnlinkPromises = subjectsToUnlink.map(subId => subjectIsNotAboutTopic(subId, topicName));
      const subjectLinkPromises = subjectsToLink.map(subId => subjectIsAboutTopic(subId, topicName));

      // Concepts
      const conceptsToUnlink = originalConceptIds.filter(id => !currentConceptIds.includes(id));
      const conceptsToLink = currentConceptIds.filter(id => !originalConceptIds.includes(id));

      const getConceptDataById = (id) => {
        const found = concepts.find(c => c.id === id);
        return found ? { name: found.name_es || found.name, id: found.id } : null;
      };

      const conceptUnlinkPromises = conceptsToUnlink.map(cId => {
        const cData = getConceptDataById(cId);
        if (cData) return topicIsNotAboutConcept(topicId, cData.name, cData.id);
        return Promise.resolve();
      });

      const conceptLinkPromises = conceptsToLink.map(cId => {
        const cData = getConceptDataById(cId);
        if (cData) return topicIsAboutConcept(topicId, cData.name); 
        return Promise.resolve();
      });
      
      await Promise.all([
        ...subjectUnlinkPromises,
        ...subjectLinkPromises,
        ...conceptUnlinkPromises,
        ...conceptLinkPromises
      ]);

      setTopicModalVisible(false);
      setEditingItem(null);
      fetchData();
      Alert.alert(t('success'), t('success'));

    } catch (e) {
      console.error(e);
      Alert.alert(t('error'), t('error'));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTopic = (orderId) => {
      const performDelete = async () => {
        try {
          await deleteTopic(orderId);
          fetchData();
        } catch (error) {
          console.error("Error al eliminar", error);
        }
      };
  
      if (Platform.OS === 'web') {
        if (window.confirm(t('deleteGroupConfirm'))) {
          performDelete();
        }
      } else {
        Alert.alert(t('delete'), t('deleteGroupConfirm'), [
          { text: t('cancel'), style: 'cancel' },
          { 
            text: t('delete'), 
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
  
      const relationsToLink = incomingRelations.filter(r => !originalIdsFromModal.includes(r.id));

      const linkPromises = relationsToLink.map(relation => {
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
      Alert.alert(t('success'), t('success'));
  
    } catch (e) { 
      console.error(e);
      const msg = e.response?.data?.detail || t('error');
      Alert.alert(t('error'), msg); 
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConcept = (conceptId) => {
      const performDelete = async () => {
        try {
          await deleteConcept(conceptId);
          fetchData();
        } catch (error) {
          console.error("Error al eliminar", error);
        }
      };
  
      if (Platform.OS === 'web') {
        if (window.confirm(t('deleteGroupConfirm'))) {
          performDelete();
        }
      } else {
        Alert.alert(t('delete'), t('deleteGroupConfirm'), [
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
    setEditingItem(null);
    if (activeTab === 'topics') setTopicModalVisible(true);
    else setConceptModalVisible(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    if (activeTab === 'topics') setTopicModalVisible(true);
    else setConceptModalVisible(true);
  };

  const renderTopicItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.card} 
      onPress={() => navigation.navigate('TopicDetail', { topic: item })}
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
          <Trash2 size={20} color={COLORS.danger} />
        </TouchableOpacity>
        <ChevronRight size={20} color={COLORS.gray} />
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
             <Text style={styles.cardSub}>{t('relatedTo')}: {item.related_concepts.length}</Text>
          )}
        </View>
      </View>
      <TouchableOpacity onPress={() => openEditModal(item)} style={styles.iconBtn}>
        <Edit size={20} color={COLORS.secondary} />
      </TouchableOpacity>
      <View style={styles.actions}>
        <TouchableOpacity onPress={() => handleDeleteConcept(item.id)} style={styles.iconBtn}>
          <Trash2 size={20} color={COLORS.danger} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('academicContent')}</Text>
        <TouchableOpacity onPress={openCreateModal}>
          <PlusCircle size={30} color={COLORS.secondary} />
        </TouchableOpacity>
      </View>

      <View style={styles.tabsContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'topics' && styles.activeTab]} 
          onPress={() => setActiveTab('topics')}
        >
          <Text style={[styles.tabText, activeTab === 'topics' && styles.activeTabText]}>{t('topics')}</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'concepts' && styles.activeTab]} 
          onPress={() => setActiveTab('concepts')}
        >
          <Text style={[styles.tabText, activeTab === 'concepts' && styles.activeTabText]}>{t('concepts')}</Text>
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
          ListEmptyComponent={<Text style={styles.empty}>{t('noContent')}</Text>}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}

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
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  title: { fontSize: 24, fontWeight: 'bold', color: COLORS.text },
  
  tabsContainer: { flexDirection: 'row', marginBottom: 15, backgroundColor: COLORS.lightGray, borderRadius: 8, padding: 2 },
  tab: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 6 },
  activeTab: { backgroundColor: COLORS.surface, elevation: 2 },
  tabText: { fontWeight: '600', color: COLORS.textSecondary },
  activeTabText: { color: COLORS.primary },

  card: { backgroundColor: COLORS.surface, padding: 15, borderRadius: 10, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', elevation: 2 },
  cardContent: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  textContainer: { marginLeft: 15, flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: COLORS.text },
  cardSub: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconBtn: { padding: 5 },
  empty: { textAlign: 'center', marginTop: 30, color: COLORS.textSecondary }
});