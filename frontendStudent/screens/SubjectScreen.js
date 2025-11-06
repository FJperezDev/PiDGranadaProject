import { useLanguage } from "../context/LanguageContext";
import { useNavigation } from '@react-navigation/native';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { StyledButton } from "../components/StyledButton";
import { Hexagon, Clipboard } from 'lucide-react-native';
import { useRef, useEffect, useState } from "react";
import { mockApi } from "../services/api";

export const SubjectScreen = ({ route }) => {
  const navigation = useNavigation();
  const { t, language } = useLanguage();
  const [subjectData, setSubjectData] =  useState(route.params.subjectData);
  const didMountRef = useRef(false);

  useEffect(() => {
    if(!didMountRef.current){
      didMountRef.current = true;
      return;
    }

    const fetchData = async () => {
      try {
        const response = await mockApi.validateSubjectCode(subjectData.id);
        setSubjectData(response.subject);
      } catch (error) {
        console.error("Error actualizando los datos de la asignatura: ", error);
      }
    };

    fetchData();
  }, [language]);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      key={item.id}
      style={{
        backgroundColor: 'white',
        padding: 16,
        borderRadius: 10,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#e0f7fa',
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 5,
      }}
      
      onPress={() => {
        navigation.navigate('TopicDetail', { topic: item });
      }}
    >
      <Text style={{ fontSize: 18, fontWeight: '600', color: '#000' }}>
        {item.name}
      </Text>
      <Text style={{ fontSize: 14, color: '#555', marginTop: 4 }}>
        {item.description}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, width: '100%', maxWidth: 800, alignSelf: 'center', padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#000', textAlign: 'center', marginVertical: 20 }}>
        {subjectData.title}
      </Text>

      <FlatList
        data={subjectData.topics}
        extraData={subjectData}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
      />
      {/* Botones inferiores */}
      <View style={styles.container}>
        <StyledButton title={t('hexagonGame')} icon={<Hexagon size={20} />} onPress={() => navigation.navigate('Game')} style={styles.leftButton} />
        <StyledButton title={t('exam')} icon={<Clipboard size={20} />} onPress={() => navigation.navigate('ExamSetup', { topics: subjectData.topics, nQuestions: 10 })} style={styles.rightButton} />
      </View>
    </View>
  );
};

const styles = {
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
  },
  leftButton: {
    flex: 1,
    marginRight: 10,
  },
  rightButton: {
    flex: 1,
    marginLeft: 10,
  },
};