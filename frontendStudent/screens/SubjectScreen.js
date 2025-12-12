import { useEffect, useState } from "react";
import { View, Text, FlatList, Platform, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';

import { useLanguage } from "../context/LanguageContext";
import { useVoiceControl } from "../context/VoiceContext";
import { mockApi } from "../services/api";

import { StyledButton } from "../components/StyledButton";
import { Hexagon, Clipboard } from 'lucide-react-native';
import { COLORS } from "../constants/colors";

export const SubjectScreen = ({ route }) => {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const { t, language } = useLanguage();
  const { transcript, setTranscript } = useVoiceControl();

  const [subjectData, setSubjectData] =  useState();
  const [topicsData, setTopicsData] = useState();
  const { code } = route.params;

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
    <StyledButton
      // Sobreescribimos estilos para que parezca una Card y no un botón redondo
      style={styles.topicCard}
      onPress={() => navigation.navigate('TopicDetail', { topic: item })}
    >
      <View style={styles.topicContent}>
        <Text style={styles.topicTitle}>
          {item.order_id + ". " + item.title}
        </Text>
        <Text style={styles.topicDescription} numberOfLines={2}>
          {item.description}
        </Text>
      </View>
    </StyledButton>
  );

  if (!subjectData || !topicsData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>{t('loading')}</Text>
      </View>
    );
  }

  return (
    <View style={styles.mainContainer}>
      <View style={styles.contentContainer}>
        
        <Text style={styles.headerTitle}>
          {subjectData.name}
        </Text>

        <FlatList
          data={topicsData}
          renderItem={renderItem}
          keyExtractor={(item) => String(item.order_id)}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />

        {/* Botones inferiores */}
        <View style={styles.footerContainer}>
          <StyledButton 
            title={t('hexagonGame')} 
            icon={<Hexagon size={20} color={COLORS.text} />} 
            onPress={() => navigation.navigate('Game')} 
            style={[styles.footerButton, styles.buttonGame]} 
            textStyle={{ color: COLORS.text }}
          />
          
          <StyledButton 
            title={t('exam')} 
            icon={<Clipboard size={20} color={COLORS.text} />} 
            onPress={() => navigation.navigate('ExamSetup', { topics: topicsData, nQuestions: 10, code: code })} 
            style={[styles.footerButton, styles.buttonExam]}
            textStyle={{ color: COLORS.text }}
          />
        </View>

      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  // Contenedor principal (Fondo completo)
  mainContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  // Contenedor de contenido (Limitado en ancho para Web/Tablet)
  contentContainer: {
    flex: 1,
    width: '100%',
    maxWidth: 800,
    alignSelf: 'center',
    padding: 20,
  },
  // Pantalla de Carga
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: 10,
    color: COLORS.textSecondary,
    fontSize: 16,
  },
  // Título
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginVertical: 24,
  },
  // Lista
  listContent: {
    paddingBottom: 20,
  },
  // Tarjeta de Tema (StyledButton modificado)
  topicCard: {
    backgroundColor: COLORS.surface,
    marginBottom: 12,
    borderRadius: 12, // Menos redondeado que el botón estándar
    borderWidth: 1,
    borderColor: COLORS.borderLight, // Borde sutil
    paddingVertical: 16,
    paddingHorizontal: 16,
    alignItems: 'stretch', // Para que el texto ocupe el ancho
    justifyContent: 'flex-start',
    // Sombras
    ...Platform.select({
      ios: {
        shadowColor: COLORS.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: { elevation: 3 },
      web: { boxShadow: '0px 2px 8px rgba(0,0,0,0.05)' }
    }),
  },
  topicContent: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  topicTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  topicDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  // Footer
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    gap: 12, // Espacio entre botones
  },
  footerButton: {
    flex: 1,
    // Aseguramos altura consistente
    height: 50,
  },
  buttonGame: {
    backgroundColor: COLORS.primaryVeryLight, // Un tono más claro para diferenciar
    borderColor: COLORS.primaryLight,
    borderWidth: 1,
  },
  buttonExam: {
    backgroundColor: COLORS.primary, // Color principal
  }
});