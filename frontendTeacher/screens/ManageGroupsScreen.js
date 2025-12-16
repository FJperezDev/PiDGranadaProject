import React, { useState, useContext, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, RefreshControl, Platform, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext'; 
import { getMyGroups, getOtherGroups, getSubjects, createGroup, createSubject } from '../api/coursesRequests'; 
import CreateGroupModal from '../components/CreateGroupModal';
import CreateSubjectModal from '../components/CreateSubjectModal';
import { PlusCircle, BookOpen } from 'lucide-react-native'; 
import { COLORS } from '../constants/colors';
import { useLanguage } from '../context/LanguageContext';

export default function ManageGroupsScreen({ navigation }) {
  const { isSuper } = useContext(AuthContext);
  const { t, language } = useLanguage();

  const [myGroups, setMyGroups] = useState([]);
  const [otherGroups, setOtherGroups] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [groupModalVisible, setGroupModalVisible] = useState(false);
  const [subjectModalVisible, setSubjectModalVisible] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const subjectsData = await getSubjects();
      setSubjects(subjectsData);

      const myGroupsData = await getMyGroups();
      setMyGroups(myGroupsData);
      
      if (isSuper) {
        const otherGroupsData = await getOtherGroups();
        setOtherGroups(otherGroupsData);
      }
    } catch (error) {
      Alert.alert(t('error'), t('error'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [language]);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [isSuper])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleOpenGroupModal = () => {
    if (subjects.length === 0) {
      Alert.alert(t('error'), t('noSubjects'));
      return;
    }
    setGroupModalVisible(true);
  };

  const handleCreateGroup = async (subjectId, nameEs, nameEn) => {
    try {
      await createGroup(subjectId, nameEs, nameEn);
      setGroupModalVisible(false);
      Alert.alert(t('success'), t('success'));
      fetchData(); 
    } catch (error) {
      Alert.alert(t('error'), t('error'));
    }
  };

  const handleOpenSubjectModal = () => {
    setSubjectModalVisible(true);
  };

  const handleCreateSubject = async (nameEs, nameEn, descEs, descEn) => {
    try {
      await createSubject(nameEs, nameEn, descEs, descEn);
      setSubjectModalVisible(false);
      Alert.alert(t('success'), t('success'));
      fetchData();
    } catch (error) {
      Alert.alert(t('error'), t('error'));
    }
  };

  const renderGroup = ({ item }) => (
    <TouchableOpacity
      style={styles.groupButton}
      onPress={() => navigation.navigate('GroupDetail', { group: item })}
    >
      <Text style={styles.groupButtonText}>{item.name}</Text>
    </TouchableOpacity>
  );

  const renderSubject = ({ item }) => (
    <TouchableOpacity
      style={[styles.groupButton, { borderLeftWidth: 5, borderLeftColor: COLORS.primary }]}
      onPress={() => navigation.navigate('SubjectTopics', { subject: item })} 
    >
      <View style={{flexDirection: 'row', alignItems: 'center'}}>
        <BookOpen size={24} color={COLORS.primary} style={{marginRight: 10}}/>
        <Text style={styles.groupButtonText}>{item.name_es || item.name}</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading && !refreshing) {
    return <ActivityIndicator style={styles.loader} size="large" color={COLORS.primary} />;
  }

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>{t('teachingManagement')}</Text>
        </View>

        <View style={styles.header}>
          <View>
            <Text style={styles.sectionTitle}>{t('subjects')}</Text>
            <Text style={styles.subtitle}>{t('touchToOrder')}</Text>
          </View>
          <TouchableOpacity onPress={handleOpenSubjectModal}>
            <PlusCircle size={30} color={COLORS.secondary} />
          </TouchableOpacity>
        </View>

        {subjects.length > 0 ? (
          subjects.map((subject) => (
            <View key={subject.id}>
                {renderSubject({ item: subject })}
            </View>
          ))
        ) : (
            <Text style={styles.emptyText}>{t('noSubjects')}</Text>
        )}

        <View style={styles.divider} />

        <View style={styles.header}>
          <Text style={styles.sectionTitle}>{t('myGroups')}</Text>
          <TouchableOpacity onPress={handleOpenGroupModal}>
            <PlusCircle size={30} color={COLORS.secondary} />
          </TouchableOpacity>
        </View>
        
        {myGroups.length > 0 ? (
             myGroups.map((group) => (
                <View key={group.id}>{renderGroup({ item: group })}</View>
             ))
        ) : (
            <Text style={styles.emptyText}>{t('noGroups')}</Text>
        )}

        {isSuper && (
          <>
            <View style={styles.divider} />
            <Text style={styles.sectionTitle}>{t('otherGroups')}</Text>
            {otherGroups.map((group) => (
                <View key={group.id}>{renderGroup({ item: group })}</View>
            ))}
          </>
        )}
      </ScrollView>

      {subjects.length > 0 && (
        <CreateGroupModal
          visible={groupModalVisible}
          subjects={subjects}
          onClose={() => setGroupModalVisible(false)}
          onSubmit={handleCreateGroup}
        />
      )}
      <CreateSubjectModal
        visible={subjectModalVisible}
        onClose={() => setSubjectModalVisible(false)}
        onSubmit={handleCreateSubject}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: COLORS.background,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  groupButton: {
    backgroundColor: COLORS.surface,
    padding: 20,
    borderRadius: 10,
    marginBottom: 15,
    ...(Platform.OS === 'web'
      ? { boxShadow: '0px 1px 3px rgba(0,0,0,0.1)' }
      : {
          shadowColor: COLORS.shadow,
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 3,
          elevation: 3,
        }),
  },
  groupButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.primaryDark,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 20,
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 10,
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 15,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 15,
  }
});