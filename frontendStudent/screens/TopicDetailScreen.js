import { useLanguage } from "../context/LanguageContext";
import { useState, useEffect } from "react";
import { mockApi } from "../services/api";
import { ContentModal } from "../components/ContentModal";
import { ConceptModal } from "../components/ConceptModal"; 
import { StyledButton } from "../components/StyledButton";
import { View, Text, StyleSheet, ScrollView, Platform, ActivityIndicator } from "react-native";
import { COLORS } from "../constants/colors";
import { Ionicons } from '@expo/vector-icons'; 
import { useVoiceControl } from "../context/VoiceContext";
import { useIsFocused, useNavigation } from "@react-navigation/native";

export const TopicDetailScreen = ({ route }) => {
  const { t, language } = useLanguage();
  const isFocused = useIsFocused();
  const { transcript, setTranscript } = useVoiceControl();
  const [conceptData, setConceptData] = useState(null); 
  const [topicData, setTopicData] = useState(null); 
  const [isLoading, setIsLoading] = useState(true);
  const navigation = useNavigation();

  // Modales
  const [epigraphModalVisible, setEpigraphModalVisible] = useState(false);
  const [epigraphContent, setEpigraphContent] = useState({ title: "", content: "" });

  const [conceptModalVisible, setConceptModalVisible] = useState(false);
  const [selectedConcept, setSelectedConcept] = useState(null);

  const { topic } = route.params; 

  const fetchTopicDetails = async () => {
    try {
      setIsLoading(true);
      const data = await mockApi.getTopicDetails(topic.title);
      const concepts = await mockApi.getConcepts();
      setConceptData(concepts);
      setTopicData(data);
    } catch (error) {
      console.error("Error obteniendo los detalles del tema:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const normalizeText = (text) => {
    return text ? text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim() : "";
  };

  useEffect(() => {
    if (!transcript || !isFocused) return;

    const spoken = normalizeText(transcript);

    if (spoken.includes('cerrar') || spoken.includes('close')) {
        setEpigraphModalVisible(false);
        setConceptModalVisible(false);
        setTranscript('');
        return;
    }

    if (spoken.includes('volver') || spoken.includes('atras') || spoken.includes('back')) {
        if (epigraphModalVisible || conceptModalVisible) {
            setEpigraphModalVisible(false);
            setConceptModalVisible(false);
            setTranscript('');
            return;
        }

        if (navigation.canGoBack()) {
            navigation.goBack();
        } else {
            navigation.navigate('Home');
        }
        setTranscript('');
        return;
    }

    if (topicData) {
        if (topicData.concepts) {
            const foundConcept = topicData.concepts.find(c => {
                const normName = normalizeText(c.name);
                return spoken.includes(normName) || normName.includes(spoken);
            });
            if (foundConcept) {
                handleConceptPress(foundConcept);
                setTranscript('');
                return;
            }
        }
        if (topicData.epigraphs) {
            const foundEpigraph = topicData.epigraphs.find(e => {
                const normName = normalizeText(e.name);
                return spoken.includes(normName) || normName.includes(spoken);
            });
            if (foundEpigraph) {
                handleEpigraphPress(foundEpigraph);
                setTranscript('');
                return;
            }
        }
    }

  }, [transcript, isFocused, topicData, epigraphModalVisible, conceptModalVisible, navigation]);

  useEffect(() => {
    fetchTopicDetails();
  }, [topic, language]);

  const handleEpigraphPress = (item) => {
    setEpigraphContent({ title: item.name, content: item.description });
    setEpigraphModalVisible(true);
  };

  const handleConceptPress = (concept) => {
    setSelectedConcept(concept);
    setConceptModalVisible(true);
  };

  const handleRelatedConceptNavigation = (target) => {
    if (!topicData || !topicData.concepts) return;

    let foundConcept = null;
    if (typeof target === 'object' && target.id) {
       foundConcept = conceptData.find(c => c.id === target.id);
    } else if (typeof target === 'object' && target.name) {
       foundConcept = conceptData.find(c => c.name === target.name);
    } else if (typeof target === 'string') {
       foundConcept = conceptData.find(c => c.name === target);
    }

    if (foundConcept) {
      setSelectedConcept(foundConcept);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>{t("loading")}</Text>
      </View>
    );
  }

  if (!topicData) {
    return (
      <View style={styles.loadingContainer}>
        <Text>{t("error_loading")}</Text>
      </View>
    );
  }

  return (
    <View style={styles.mainContainer}>
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContentContainer} 
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.responsiveContainer}>
            
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.headerTitle}>{topicData.topic.title}</Text>
              <Text style={styles.headerDescription}>{topicData.topic.description}</Text>
            </View>
            
            {/* SECCIÓN CONCEPTOS */}
            <View style={styles.sectionHeader}>
              <Ionicons name="bulb" size={20} color={COLORS.primary} />
              <Text style={styles.sectionTitle}>{t("concepts")}</Text>
            </View>
            
            {topicData.concepts && topicData.concepts.length > 0 ? (
              topicData.concepts.map((item) => (
                <StyledButton 
                  // AQUÍ ESTÁ LA CORRECCIÓN CLAVE: Sobreescribimos el layout del botón
                  style={styles.cardButton} 
                  key={`concept-${item.id}`} 
                  onPress={() => handleConceptPress(item)}
                >
                  <View style={styles.cardContent}>
                    <View style={styles.cardTextContainer}>
                      <Text style={styles.itemTitle}>{item.name}</Text>
                      <Text style={styles.itemSubtitle} numberOfLines={2}>
                        {item.description}
                      </Text>
                    </View>
                    {item.related_concepts && item.related_concepts.length > 0 && (
                      <View style={styles.badge}>
                        <Ionicons name="git-network-outline" size={14} color={COLORS.surface} />
                        <Text style={styles.badgeText}>{item.related_concepts.length}</Text>
                      </View>
                    )}
                  </View>
                </StyledButton>
              ))
            ) : (
              <Text style={styles.emptyText}>{t("no_concepts")}</Text>
            )}

            {/* SECCIÓN EPÍGRAFES */}
            <View style={styles.sectionHeader}>
              <Ionicons name="list" size={20} color={COLORS.primary} />
              <Text style={styles.sectionTitle}>{t("headings")}</Text>
            </View>

            {topicData.epigraphs && topicData.epigraphs.length > 0 ? (
              topicData.epigraphs.map((item) => (
                <StyledButton 
                  style={[styles.cardButton, styles.epigraphCard]} 
                  key={`epigraph-${item.id}`} 
                  onPress={() => handleEpigraphPress(item)}
                >
                  <Text style={styles.epigraphTitle}>
                    {item.name}
                  </Text>
                  <Ionicons name="chevron-forward" size={18} color={COLORS.secondary} />
                </StyledButton>
              ))
            ) : (
              <Text style={styles.emptyText}>{t("no_headings")}</Text>
            )}

        </View>
      </ScrollView>

      <ContentModal
        visible={epigraphModalVisible}
        onClose={() => setEpigraphModalVisible(false)}
        title={epigraphContent.title}
        content={epigraphContent.content}
      />

      <ConceptModal
        visible={conceptModalVisible}
        onClose={() => setConceptModalVisible(false)}
        concept={selectedConcept}
        t={t}
        onRelatedPress={handleRelatedConceptNavigation}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
    width: '100%',
  },
  scrollContentContainer: {
    flexGrow: 1,
    alignItems: 'center', 
    paddingBottom: 40,
  },
  responsiveContainer: {
    width: '100%',
    maxWidth: 800, 
    padding: 20,
    alignItems: 'stretch', // Asegura que los hijos ocupen el ancho disponible
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: COLORS.background,
  },
  loadingText: {
    color: COLORS.secondary,
  },
  header: {
    paddingTop: 10,
    marginBottom: 10,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  headerDescription: {
    fontSize: 16,
    color: COLORS.textSecondary || COLORS.text,
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 10,
    lineHeight: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 16,
    gap: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    alignSelf: 'flex-start', // Alinea el título de sección a la izquierda
    width: '100%',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.text,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  // --- CORRECCIÓN CRÍTICA DE ESTILOS DE TARJETA ---
  cardButton: {
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    
    // ESTAS 3 LÍNEAS ARREGLAN EL DESASTRE VISUAL:
    width: '100%',            // Ocupa todo el ancho del contenedor
    alignItems: 'stretch',    // Sobreescribe el 'center' del StyledButton original
    justifyContent: 'center', // Mantiene contenido centrado verticalmente si es necesario

    ...Platform.select({
      web: { boxShadow: '0px 2px 8px rgba(0,0,0,0.05)' },
      default: {
        shadowColor: COLORS.shadow,
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
      },
    }),
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%', // Asegura que el contenido interno use todo el espacio
  },
  cardTextContainer: {
    flex: 1, // Toma todo el espacio excepto el badge
    marginRight: 10,
    alignItems: 'flex-start', // Alinea el texto a la izquierda
  },
  itemTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 4,
    textAlign: 'left', // Fuerza alineación izquierda del texto
  },
  itemSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary || COLORS.secondary,
    lineHeight: 20,
    textAlign: 'left', // Fuerza alineación izquierda del texto
  },
  badge: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
    alignSelf: 'flex-start', // Evita que el badge se estire
  },
  badgeText: {
    color: COLORS.surface,
    fontSize: 12,
    fontWeight: 'bold',
  },
  epigraphCard: {
    flexDirection: 'row', // Sobreescribe si cardButton tuviera column
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 18,
  },
  epigraphTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: COLORS.text,
    flex: 1,
    textAlign: 'left',
  },
  emptyText: {
    fontStyle: 'italic',
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginVertical: 10,
  },
});