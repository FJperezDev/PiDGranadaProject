import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Alert, ActivityIndicator, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getSubjects, createSubject, createGroup, deleteSubject, getSubjectGroups } from '../api/coursesRequests';
import CreateGroupModal from '../components/CreateGroupModal';
import CreateSubjectModal from '../components/CreateSubjectModal';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal'; // <--- IMPORTANTE
import { Plus, Users, Book, Trash2, ChevronRight } from 'lucide-react-native';
import { COLORS } from '../constants/colors';
import { useLanguage } from '../context/LanguageContext';
import { StyledButton } from '../components/StyledButton';

export default function ManageGroupsScreen({ navigation }) {
  const { t, language } = useLanguage();
  const [subjects, setSubjects] = useState([]);
  const [groups, setGroups] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('groups');

  // Modales de creación
  const [groupModalVisible, setGroupModalVisible] = useState(false);
  const [subjectModalVisible, setSubjectModalVisible] = useState(false);

  // Estados para el Modal de Borrado
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [subjectToDelete, setSubjectToDelete] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const subData = await getSubjects();
      setSubjects(subData);
      
      const allGroupsMap = new Map();

      await Promise.all(subData.map(async (sub) => {
          try {
              const gData = await getSubjectGroups(sub.id);
              gData.forEach(g => {
                  allGroupsMap.set(g.id, { 
                      ...g, 
                      subjectName: sub.name, 
                      subjectId: sub.id 
                  });
              });
          } catch(e) {
              console.error("Error cargando grupos de asignatura " + sub.id);
          }
      }));
      
      setGroups(Array.from(allGroupsMap.values()));

    } catch (error) {
      console.error(error);
      Alert.alert(t('error'), t('error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [language]);
  useFocusEffect(useCallback(() => { fetchData(); }, []));

  // --- CREACIÓN ---

  const handleCreateGroup = async (subjectId, nameEs, nameEn) => {
    try {
      setGroupModalVisible(false);
      setLoading(true);
      await createGroup(subjectId, { name_es: nameEs, name_en: nameEn });
      Alert.alert(t('success'), t('success'));
      fetchData();
    } catch (error) { 
        Alert.alert(t('error'), error.response?.data?.detail || t('error')); 
        setLoading(false);
    }
  };

  const handleCreateSubject = async (nameEs, nameEn, descEs, descEn) => {
    try {
      setSubjectModalVisible(false);
      setLoading(true);
      await createSubject({ name_es: nameEs, name_en: nameEn, description_es: descEs, description_en: descEn });
      Alert.alert(t('success'), t('success'));
      fetchData();
    } catch (error) { 
        Alert.alert(t('error'), error.response?.data?.detail || t('error'));
        setLoading(false);
    }
  };

  // --- BORRADO (LÓGICA NUEVA) ---

  // 1. Abrir modal y guardar qué vamos a borrar
  const openDeleteModal = (subject) => {
      setSubjectToDelete(subject);
      setDeleteModalVisible(true);
  };

  // 2. Ejecutar borrado al confirmar
  const handleConfirmDelete = async () => {
      if (!subjectToDelete) return;

      try {
          setDeleteModalVisible(false); // Cerramos modal visualmente
          setLoading(true); // Ponemos spinner global
          
          await deleteSubject(subjectToDelete.id);
          
          // No mostramos alert de éxito para agilizar, o puedes ponerlo:
          // Alert.alert(t('success'), t('success'));
          fetchData(); 
      } catch(e) { 
          Alert.alert(t('error'), t('error')); 
          setLoading(false);
      } finally {
          setSubjectToDelete(null);
      }
  };

  // --- RENDER ---

  const renderGroupItem = ({ item }) => (
    <StyledButton 
        variant="secondary"
        style={styles.card}
        onPress={() => navigation.navigate('GroupDetail', { group: item })}
    >
        <View style={styles.cardInner}>
            <View style={styles.iconBox}>
                <Users size={24} color={COLORS.primary} />
            </View>
            <View style={styles.textContainer}>
                <Text style={styles.cardTitle}>{item.name}</Text>
                <Text style={styles.cardSub}>{item.subjectName || "Sin Asignatura"}</Text>
            </View>
            <ChevronRight size={20} color={COLORS.border} />
        </View>
    </StyledButton>
  );

  const renderSubjectItem = ({ item }) => (
    <StyledButton 
        variant="secondary"
        style={styles.card}
        onPress={() => navigation.navigate('SubjectTopics', { subject: item })}
    >
        <View style={styles.cardInner}>
            <View style={[styles.iconBox, {backgroundColor: COLORS.secondaryLight}]}>
                <Book size={24} color={COLORS.secondary} />
            </View>
            <View style={styles.textContainer}>
                <Text style={styles.cardTitle}>{item.name}</Text>
                <Text style={styles.cardSub} numberOfLines={1}>{item.description}</Text>
            </View>
            
            {/* Botón de borrar llama a openDeleteModal */}
            <StyledButton 
                onPress={() => openDeleteModal(item)} 
                variant="ghost" 
                size="small" 
                style={{padding: 8}}
            >
                <Trash2 size={20} color={COLORS.danger} />
            </StyledButton>
        </View>
    </StyledButton>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('teachingManagement')}</Text>
        <View style={{flexDirection:'row', gap: 10}}>
            <StyledButton onPress={() => setSubjectModalVisible(true)} size="small" variant="secondary" icon={<Plus size={18} color={COLORS.text}/>} title={t('subject')} />
            <StyledButton onPress={() => setGroupModalVisible(true)} size="small" icon={<Plus size={18} color={COLORS.white}/>} title={t('group')} />
        </View>
      </View>

      <View style={styles.tabsContainer}>
        <StyledButton 
            onPress={() => setActiveTab('groups')} 
            variant={activeTab === 'groups' ? 'primary' : 'ghost'} 
            style={styles.tab} 
            title={t('myGroups')}
            textStyle={activeTab !== 'groups' && {color: COLORS.textSecondary}}
        />
        <StyledButton 
            onPress={() => setActiveTab('subjects')} 
            variant={activeTab === 'subjects' ? 'primary' : 'ghost'} 
            style={styles.tab} 
            title={t('subjects')}
            textStyle={activeTab !== 'subjects' && {color: COLORS.textSecondary}}
        />
      </View>

      {loading ? <ActivityIndicator size="large" color={COLORS.primary} style={{marginTop: 20}}/> : (
        <FlatList
          data={activeTab === 'groups' ? groups : subjects}
          renderItem={activeTab === 'groups' ? renderGroupItem : renderSubjectItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={{ paddingBottom: 80, gap: 10 }}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchData} />}
          ListEmptyComponent={<Text style={styles.empty}>{activeTab === 'groups' ? t('noGroups') : t('noSubjects')}</Text>}
        />
      )}

      {/* Modales de Creación */}
      <CreateGroupModal 
        visible={groupModalVisible} 
        subjects={subjects} 
        onClose={() => setGroupModalVisible(false)} 
        onSubmit={handleCreateGroup} 
      />
      
      <CreateSubjectModal 
        visible={subjectModalVisible} 
        onClose={() => setSubjectModalVisible(false)} 
        onSubmit={handleCreateSubject} 
      />

      {/* Modal de Borrado */}
      <ConfirmDeleteModal
        visible={deleteModalVisible}
        onClose={() => setDeleteModalVisible(false)}
        onConfirm={handleConfirmDelete}
        title={`${t('delete')} ${t('subject')}`} // "Borrar Asignatura"
        message={`${t('deleteGroupConfirm')} "${subjectToDelete?.name}"?`} // "¿Seguro que...? 'Matemáticas'?"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: COLORS.background },
  header: { marginBottom: 20 },
  title: { fontSize: 26, fontWeight: '800', color: COLORS.text, marginBottom: 15 },
  
  tabsContainer: { flexDirection: 'row', marginBottom: 20, backgroundColor: COLORS.surface, borderRadius: 12, padding: 4, borderWidth: 1, borderColor: COLORS.borderLight },
  tab: { flex: 1, borderRadius: 8, paddingVertical: 8 },

  card: { paddingHorizontal: 0, paddingVertical: 0, justifyContent: 'center', alignItems: 'stretch' },
  cardInner: { flexDirection: 'row', alignItems: 'center', padding: 16, width: '100%' },
  iconBox: { width: 48, height: 48, borderRadius: 12, backgroundColor: COLORS.primaryVeryLight, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  textContainer: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text, marginBottom: 2 },
  cardSub: { fontSize: 13, color: COLORS.textSecondary },
  empty: { textAlign: 'center', marginTop: 40, color: COLORS.textSecondary, fontSize: 16 }
});