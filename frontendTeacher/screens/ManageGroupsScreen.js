import React, { useState, useContext, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, RefreshControl, Platform } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext'; 
import { getMyGroups, getOtherGroups, getSubjects, createGroup } from '../api/coursesRequests'; 
import CreateGroupModal from '../components/CreateGroupModal';
import { PlusCircle } from 'lucide-react-native';
import { COLORS } from '../constants/colors';

export default function ManageGroupsScreen({ navigation }) {
  // const { t } = useContext(LanguageContext); // Asumo que tienes algo así
  const { loggedUser, isSuper } = useContext(AuthContext);

  const [myGroups, setMyGroups] = useState([]);
  const [otherGroups, setOtherGroups] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

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

  // useFocusEffect se ejecuta cada vez que la pantalla entra en foco
  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [isSuper]) // Se vuelve a ejecutar si cambia el rol del usuario
  );

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleOpenModal = () => {
    if (subjects.length === 0) {
      Alert.alert('Error', 'No hay asignaturas creadas. Debes crear una asignatura primero.');
      return;
    }
    setModalVisible(true);
  };

  const handleCreateGroup = async (subjectId, name) => {
    try {
      await createGroup(subjectId, name_es=name, name_en=name);
      setModalVisible(false);
      Alert.alert('Éxito', 'Grupo creado correctamente.');
      fetchData(); // Recargar la lista de grupos
    } catch (error) {
      Alert.alert('Error', 'No se pudo crear el grupo.');
    }
  };

  const renderGroup = ({ item }) => (
    <TouchableOpacity
      style={styles.groupButton}
      onPress={() => navigation.navigate('GroupDetail', { group: item })}
    >
      <Text style={styles.groupButtonText}>{item.name}</Text>
      {/* Podrías mostrar la asignatura aquí si la API la devuelve */}
    </TouchableOpacity>
  );

  if (loading && !refreshing) {
    return <ActivityIndicator style={styles.loader} size="large" />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mis Grupos</Text>
        <TouchableOpacity onPress={handleOpenModal}>
          <PlusCircle size={30} color={COLORS.secondary || 'blue'} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={myGroups}
        renderItem={renderGroup}
        keyExtractor={(item) => item.id.toString()}
        style={styles.list}
        ListEmptyComponent={<Text style={styles.emptyText}>No has creado ningún grupo.</Text>}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      />

      {isSuper && (
        <>
          <Text style={styles.title}>Otros Grupos</Text>
          <FlatList
            data={otherGroups}
            renderItem={renderGroup}
            keyExtractor={(item) => item.id.toString()}
            style={styles.list}
            ListEmptyComponent={<Text style={styles.emptyText}>No hay otros grupos disponibles.</Text>}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
            }
          />
        </>
      )}

      {subjects.length > 0 && (
        <CreateGroupModal
          visible={modalVisible}
          subjects={subjects}
          onClose={() => setModalVisible(false)}
          onSubmit={handleCreateGroup}
        />
      )}
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
  list: {
    width: '100%',
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
    marginTop: 50,
    fontSize: 16,
    color: COLORS.gray || 'gray',
  },
});