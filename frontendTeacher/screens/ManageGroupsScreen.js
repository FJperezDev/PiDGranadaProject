import React, { useState, useContext, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, RefreshControl, Platform, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext'; 
import { getMyGroups, getOtherGroups, getSubjects, createGroup, createSubject } from '../api/coursesRequests'; 
import CreateGroupModal from '../components/CreateGroupModal';
import CreateSubjectModal from '../components/CreateSubjectModal';
import { PlusCircle, BookOpen } from 'lucide-react-native'; // Asegúrate de tener BookOpen
import { COLORS } from '../constants/colors';

export default function ManageGroupsScreen({ navigation }) {
  const { loggedUser, isSuper } = useContext(AuthContext);

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
      Alert.alert('Error', 'No se pudieron cargar los datos.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

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
      Alert.alert('Error', 'No hay asignaturas creadas. Debes crear una asignatura primero.');
      return;
    }
    setGroupModalVisible(true);
  };

  const handleCreateGroup = async (subjectId, name) => {
    try {
      await createGroup(subjectId, name, name);
      setGroupModalVisible(false);
      Alert.alert('Éxito', 'Grupo creado correctamente.');
      fetchData(); 
    } catch (error) {
      Alert.alert('Error', 'No se pudo crear el grupo.');
    }
  };

  const handleOpenSubjectModal = () => {
    setSubjectModalVisible(true);
  };

  const handleCreateSubject = async (name) => {
    try {
      await createSubject(name, name, name, name);
      setSubjectModalVisible(false);
      Alert.alert('Éxito', 'Asignatura creada correctamente.');
      fetchData();
    } catch (error) {
      Alert.alert('Error', 'No se pudo crear la asignatura. ');
    }
  };

  // Render para Grupos
  const renderGroup = ({ item }) => (
    <TouchableOpacity
      style={styles.groupButton}
      onPress={() => navigation.navigate('GroupDetail', { group: item })}
    >
      <Text style={styles.groupButtonText}>{item.name}</Text>
    </TouchableOpacity>
  );

  // Render para Asignaturas (NUEVO)
  const renderSubject = ({ item }) => (
    <TouchableOpacity
      style={[styles.groupButton, { borderLeftWidth: 5, borderLeftColor: COLORS.primary }]}
      onPress={() => navigation.navigate('SubjectTopics', { subject: item })} // <--- NOMBRE CORREGIDO AQUÍ
    >
      <View style={{flexDirection: 'row', alignItems: 'center'}}>
        <BookOpen size={24} color={COLORS.primary} style={{marginRight: 10}}/>
        <Text style={styles.groupButtonText}>{item.name_es || item.name}</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading && !refreshing) {
    return <ActivityIndicator style={styles.loader} size="large" />;
  }

  return (
    <View style={styles.container}>
      {/* Usamos ScrollView general en lugar de FlatList anidados */}
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Gestión Docente</Text>
        </View>

        {/* --- SECCIÓN ASIGNATURAS --- */}

        <View style={styles.header}>
          <View>
            <Text style={styles.sectionTitle}>Asignaturas</Text>
            <Text style={styles.subtitle}>Toca para ordenar temas</Text>
          </View>
	  <TouchableOpacity onPress={handleOpenSubjectModal}>
            <PlusCircle size={30} color={COLORS.secondary || 'blue'} />
          </TouchableOpacity>
        </View>

        {subjects.length > 0 ? (
          subjects.map((subject) => (
            <View key={subject.id}>
                {renderSubject({ item: subject })}
            </View>
          ))
        ) : (
            <Text style={styles.emptyText}>No hay asignaturas disponibles.</Text>
        )}

        <View style={styles.divider} />

        {/* --- SECCIÓN GRUPOS --- */}
        <View style={styles.header}>
	  <Text style={styles.sectionTitle}>Mis Grupos</Text>
	  <TouchableOpacity onPress={handleOpenGroupModal}>
            <PlusCircle size={30} color={COLORS.secondary || 'blue'} />
          </TouchableOpacity>
	</View>
        {myGroups.length > 0 ? (
             myGroups.map((group) => (
                <View key={group.id}>{renderGroup({ item: group })}</View>
             ))
        ) : (
            <Text style={styles.emptyText}>No has creado ningún grupo.</Text>
        )}

        {isSuper && (
          <>
            <View style={styles.divider} />
            <Text style={styles.sectionTitle}>Otros Grupos</Text>
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
    backgroundColor: COLORS.background || '#f7f9fa',
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
    backgroundColor: COLORS.white || 'white',
    padding: 20,
    borderRadius: 10,
    marginBottom: 15,
    ...(Platform.OS === 'web'
      ? { boxShadow: '0px 1px 3px rgba(0,0,0,0.1)' }
      : {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 3,
          elevation: 3,
        }),
  },
  groupButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.primaryDark || 'black',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 20,
    fontSize: 16,
    color: 'gray',
  },
  // Estilos nuevos
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 10,
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: 'gray',
    marginBottom: 15,
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 15,
  }
});
