import { useLanguage } from "../context/LanguageContext";
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { View, Text, FlatList, TouchableOpacity, Platform } from 'react-native';
import { StyledButton } from "../components/StyledButton";
import { Hexagon, Clipboard } from 'lucide-react-native';
import { useEffect, useState } from "react";
import { mockApi } from "../services/api";
import { useVoiceControl } from "../context/VoiceContext";

export const SubjectScreen = ({ route }) => {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const { t, language } = useLanguage();
  const [subjectData, setSubjectData] =  useState();
  const [topicsData, setTopicsData] = useState();
  const { code } = route.params;
  const { transcript, setTranscript } = useVoiceControl();

  const normalizeText = (text) => {
    return text ? text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim() : "";
  };

  useEffect(() => {
    if (!transcript || !isFocused) return;

    const spoken = normalizeText(transcript);
    console.log("Comando oído en SubjectScreen:", spoken);

    // --- A. Comandos de Navegación General ---
    if (spoken.includes('volver') || spoken.includes('atras') || spoken.includes('back')) {
        if (navigation.canGoBack()) navigation.goBack();
        else navigation.navigate('Home');
        setTranscript('');
        return;
    }

    if (spoken.includes('inicio') || spoken.includes('home') || spoken.includes('casa')) {
        navigation.navigate('Home');
        setTranscript('');
        return;
    }

    // --- B. Acciones Específicas de esta Pantalla ---
    
    // 1. Ir al Examen
    if (spoken.includes('examen') || spoken.includes('exam')) {
        if (topicsData) {
            navigation.navigate('ExamSetup', { topics: topicsData, nQuestions: 10, code: code });
            setTranscript('');
        }
        return;
    }

    // 2. Ir al Juego
    if (spoken.includes('juego') || spoken.includes('game') || spoken.includes('hexagono')) {
        navigation.navigate('Game');
        setTranscript('');
        return;
    }

    // --- C. Selección de Temas (Magic ✨) ---
    // Si el usuario dice el nombre de un tema, entramos en él.
    if (topicsData && topicsData.length > 0) {
        // Buscamos si lo que se dijo coincide con algún título de tema
        const matchedTopic = topicsData.find(topic => {
            const normalizedTitle = normalizeText(topic.title);
            // Comprobamos si el título está en lo hablado O lo hablado está en el título
            return spoken.includes(normalizedTitle) || normalizedTitle.includes(spoken);
        });

        if (matchedTopic) {
            navigation.navigate('TopicDetail', { topic: matchedTopic });
            setTranscript('');
        }
    }

  }, [transcript, topicsData, code, navigation]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        let response = await mockApi.getSubject(code);
        setSubjectData(response.subject);
        response = await mockApi.getTopics(code);
        setTopicsData(response);
      } catch (error) {
        console.error("Error actualizando los datos de la asignatura: ", error);
      }
    };

    fetchData();
  }, [language]);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={{
        backgroundColor: 'white',
        padding: 16,
        borderRadius: 10,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#e0f7fa',
        ...(Platform.OS === 'web'
          ? { boxShadow: '0px 1px 5px rgba(0,0,0,0.1)' }
          : {
              shadowColor: '#000',
              shadowOpacity: 0.1,
              shadowRadius: 5,
              elevation: 2,
            }),
      }}
      
      onPress={() => {
        navigation.navigate('TopicDetail', { topic: item });
      }}
    >
      <Text style={{ fontSize: 18, fontWeight: '600', color: '#000' }}>
        {item.title}
      </Text>
      <Text style={{ fontSize: 14, color: '#555', marginTop: 4 }}>
        {item.description}
      </Text>
    </TouchableOpacity>
  );

  if (!subjectData || !topicsData) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Cargando asignatura...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, width: '100%', maxWidth: 800, alignSelf: 'center', padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#000', textAlign: 'center', marginVertical: 20 }}>
        {subjectData.name}
      </Text>

      <FlatList
        data={topicsData}
        renderItem={renderItem}
        keyExtractor={(item) => item.order_id}
        showsVerticalScrollIndicator={false}
      />

      {/* Botones inferiores */}
      <View style={styles.container}>
        <StyledButton title={t('hexagonGame')} icon={<Hexagon size={20} />} onPress={() => navigation.navigate('Game')} style={styles.leftButton} />
        <StyledButton title={t('exam')} icon={<Clipboard size={20} />} onPress={() => navigation.navigate('ExamSetup', { topics: topicsData, nQuestions: 10, code: code })} style={styles.rightButton} />
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