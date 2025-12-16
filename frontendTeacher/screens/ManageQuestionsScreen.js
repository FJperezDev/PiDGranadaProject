import React, { useState, useCallback, useContext, useMemo, useEffect } from 'react';
import { 
    View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, 
    ActivityIndicator, Platform, ScrollView, LayoutAnimation, UIManager 
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getQuestions, deleteQuestion } from '../api/evaluationRequests';
import { COLORS } from '../constants/colors';
import { Edit, Trash2, Plus, Filter, X, Book, ChevronDown, ChevronUp } from 'lucide-react-native'; 
import QuestionWizardModal from '../components/QuestionWizardModal';
import { useLanguage } from '../context/LanguageContext';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function ManageQuestionsScreen({ navigation }) {
  const { t, language } = useLanguage();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedTopics, setSelectedTopics] = useState([]); 
  const [selectedSubjects, setSelectedSubjects] = useState([]); 
  const [showFilters, setShowFilters] = useState(false); 

  const [modalVisible, setModalVisible] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const data = await getQuestions();
      setQuestions(data);
    } catch (error) {
      Alert.alert(t('error'), t('errorLoading'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [language]);

  useFocusEffect(
    useCallback(() => {
      fetchQuestions();
    }, [])
  );

  const toggleFilters = () => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setShowFilters(!showFilters);
  };

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

  const filteredQuestions = useMemo(() => {
    return questions.filter(item => {
        const itemTopics = getTopicsFromItem(item);
        const itemSubjects = getSubjectsFromItem(item);

        const matchesTopic = selectedTopics.length === 0 || itemTopics.some(t => selectedTopics.includes(t));
        const matchesSubject = selectedSubjects.length === 0 || itemSubjects.some(s => selectedSubjects.includes(s));

        return matchesTopic && matchesSubject;
    });
  }, [questions, selectedTopics, selectedSubjects]);

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

    const confirmMsg = t('deleteGroupConfirm'); 
    if (Platform.OS === 'web') {
      if (window.confirm(confirmMsg)) {
        performDelete();
      }
    } else {
      Alert.alert(t('delete'), confirmMsg, [
        { text: t('cancel'), style: 'cancel' },
        { text: t('delete'), style: 'destructive', onPress: performDelete }
      ]);
    }
  };

  const handleEdit = (item) => { setEditingQuestion(item); setModalVisible(true); };
  const handleCreate = () => { setEditingQuestion(null); setModalVisible(true); };

  const renderItem = ({ item }) => {
    const topicNames = getTopicsFromItem(item);
    const subjectNames = getSubjectsFromItem(item);
    
    return (
      <View style={styles.row}>
        <View style={styles.infoCol}>
            <View style={styles.tagsRow}>
                 {subjectNames.map((name, index) => (
                    <View key={`sub-${index}`} style={[styles.tagContainer, { backgroundColor: COLORS.successBg }]}>
                        <Text style={[styles.tagText, { color: COLORS.success }]}>{name}</Text>
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
                <Edit size={22} color={COLORS.primary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.iconBtn}>
                <Trash2 size={22} color={COLORS.danger} />
            </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.topHeader}>
         <Text style={styles.screenTitle}>{t('questions')}</Text>
         <View style={styles.headerButtons}>
             <TouchableOpacity style={styles.addBtn} onPress={handleCreate}>
                 <Plus size={20} color="white" />
                 <Text style={styles.btnText}>{t('newQuestion')}</Text>
             </TouchableOpacity>
         </View>
      </View>

      <View style={styles.filtersCard}>
          <TouchableOpacity onPress={toggleFilters} style={styles.accordionHeader}>
              <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
                  <Filter size={18} color={COLORS.text} />
                  <Text style={styles.accordionTitle}>{t('filters')}</Text>
                  {!showFilters && (selectedSubjects.length > 0 || selectedTopics.length > 0) && (
                      <View style={styles.badge}>
                          <Text style={styles.badgeText}>{selectedSubjects.length + selectedTopics.length}</Text>
                      </View>
                  )}
              </View>
              {showFilters ? <ChevronUp size={20} color={COLORS.textSecondary}/> : <ChevronDown size={20} color={COLORS.textSecondary}/>}
          </TouchableOpacity>

          {showFilters && (
            <View style={styles.accordionContent}>
                <View style={styles.filterSection}>
                    <View style={styles.sectionHeader}>
                        <Book size={14} color={COLORS.textSecondary} />
                        <Text style={styles.sectionLabel}>{t('subjects')}</Text>
                        {selectedSubjects.length > 0 && (
                            <TouchableOpacity onPress={() => setSelectedSubjects([])}><Text style={styles.clearFilterText}>{t('clean')}</Text></TouchableOpacity>
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

                <View style={styles.separator} />

                <View style={styles.filterSection}>
                    <View style={styles.sectionHeader}>
                        <Filter size={14} color={COLORS.textSecondary} />
                        <Text style={styles.sectionLabel}>{t('topics')}</Text>
                        {selectedTopics.length > 0 && (
                            <TouchableOpacity onPress={() => setSelectedTopics([])}><Text style={styles.clearFilterText}>{t('clean')}</Text></TouchableOpacity>
                        )}
                    </View>
                    
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

      <View style={styles.tableHeader}>
          <Text style={styles.tableHeadText}>
            {filteredQuestions.length} {t('results')}
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
          ListEmptyComponent={<View style={styles.emptyContainer}><Text style={styles.empty}>{t('noResults')}</Text></View>}
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
  container: { flex: 1, backgroundColor: COLORS.background },
  
  topHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, backgroundColor: COLORS.surface, elevation: 2, zIndex: 10 },
  screenTitle: { fontSize: 22, fontWeight: 'bold', color: COLORS.text },
  headerButtons: { flexDirection: 'row', gap: 10 },
  addBtn: { flexDirection: 'row', backgroundColor: COLORS.primary, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 6, alignItems: 'center', gap: 6 },
  btnText: { color: COLORS.white, fontWeight: '600', fontSize: 13 },

  filtersCard: {
      backgroundColor: COLORS.surface,
      marginHorizontal: 15,
      marginTop: 15,
      borderRadius: 10,
      elevation: 2, 
      shadowColor: COLORS.shadow,
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
      backgroundColor: COLORS.surface
  },
  accordionTitle: { fontSize: 16, fontWeight: 'bold', color: COLORS.text },
  accordionContent: {
      paddingBottom: 15,
      borderTopWidth: 1,
      borderTopColor: COLORS.background
  },
  badge: { backgroundColor: COLORS.primary, borderRadius: 10, width: 20, height: 20, justifyContent: 'center', alignItems: 'center' },
  badgeText: { color: COLORS.white, fontSize: 10, fontWeight: 'bold' },

  filterSection: { marginTop: 12 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, marginBottom: 8, gap: 6 },
  sectionLabel: { fontSize: 13, color: COLORS.textSecondary, fontWeight: '600', flex: 1 },
  clearFilterText: { fontSize: 11, color: COLORS.primary, fontWeight: 'bold' },
  separator: { height: 1, backgroundColor: COLORS.border, marginVertical: 5, marginHorizontal: 15 },

  chipsScroll: { paddingHorizontal: 15, gap: 8 },

  chipsWrapper: { 
      paddingHorizontal: 15, 
      flexDirection: 'row', 
      flexWrap: 'wrap', 
      gap: 8 
  },

  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  chipInactive: { backgroundColor: COLORS.surface, borderColor: COLORS.border },
  chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipActiveSub: { backgroundColor: COLORS.success, borderColor: COLORS.success },

  chipText: { fontSize: 12, fontWeight: '500' },
  chipTextInactive: { color: COLORS.textSecondary },
  chipTextActive: { color: COLORS.white },

  tableHeader: { paddingHorizontal: 20, paddingVertical: 10 },
  tableHeadText: { fontWeight: 'bold', color: COLORS.textSecondary, fontSize: 12 },
  
  row: { 
      flexDirection: 'row', 
      backgroundColor: COLORS.surface, 
      padding: 15, 
      marginHorizontal: 15, 
      marginBottom: 10, 
      borderRadius: 10, 
      elevation: 1,
      shadowColor: COLORS.shadow, shadowOffset: {width: 0, height: 1}, shadowOpacity: 0.05, shadowRadius: 1
  },
  infoCol: { flex: 1, marginRight: 10 },
  tagsRow: { flexDirection: 'row', marginBottom: 8, gap: 6, flexWrap: 'wrap' },
  tagContainer: { backgroundColor: COLORS.primaryLight, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  tagText: { fontSize: 10, color: COLORS.primaryDark, fontWeight: '600' },
  statement: { fontSize: 15, color: COLORS.text, lineHeight: 22 },
  
  actionsCol: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconBtn: { padding: 8, backgroundColor: COLORS.background, borderRadius: 8 },
  
  emptyContainer: { alignItems: 'center', marginTop: 40 },
  empty: { textAlign: 'center', color: COLORS.textSecondary, fontSize: 16 },
});