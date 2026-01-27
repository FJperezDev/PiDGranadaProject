import { useLanguage } from "../context/LanguageContext";
import { useState, useEffect } from "react";
import { mockApi } from "../services/api";
import { ContentModal } from "../components/ContentModal";
import { ConceptModal } from "../components/ConceptModal";
import { StyledButton } from "../components/StyledButton";
import { View, Text, StyleSheet, ScrollView, Platform, ActivityIndicator, useWindowDimensions } from "react-native";
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

  const { width } = useWindowDimensions();
  const isLargeScreen = width > 850;

  // Modales
  const [epigraphModalVisible, setEpigraphModalVisible] = useState(false);
  const [epigraphContent, setEpigraphContent] = useState({ title: "", content: "" });
  const [conceptModalVisible, setConceptModalVisible] = useState(false);
  const [selectedConcept, setSelectedConcept] = useState(null);

  const { topic } = route.params; 

  // Obtener detalles
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

  // --- Voice Control Logic ---

  const normalizeText = (text) => {
    return text ? text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim() : "";
  };

  useEffect(() => {
    if (isFocused) setTranscript('');
  }, [isFocused]);

  useEffect(() => {
    if (!transcript || !isFocused) return;
    const spoken = normalizeText(transcript);
    if (!spoken || spoken.length < 2) return;

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
        if (navigation.canGoBack()) navigation.goBack();
        else navigation.navigate('Home');
        setTranscript('');
        return;
    }

    if (topicData) {
        if (topicData.concepts) {
            const foundConcept = topicData.concepts.find(c => {
                const normName = normalizeText(c.name);
                return normName && (spoken.includes(normName) || normName.includes(spoken));
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
                return normName && (spoken.includes(normName) || normName.includes(spoken));
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

  // Manejadores

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
    if (typeof target === 'object' && target.id) foundConcept = conceptData.find(c => c.id === target.id);
    else if (typeof target === 'object' && target.name) foundConcept = conceptData.find(c => c.name === target.name);
    else if (typeof target === 'string') foundConcept = conceptData.find(c => c.name === target);

    if (foundConcept) setSelectedConcept(foundConcept);
  };

  const ListWrapper = ({ children }) => {
    if (isLargeScreen) {
        return (
            <ScrollView 
                style={{ flex: 1, width: '100%' }}
                contentContainerStyle={{ paddingBottom: 20, paddingRight: 10 }}
                showsVerticalScrollIndicator={true}
            >
                {children}
            </ScrollView>
        );
    }
    return <View style={{ width: '100%' }}>{children}</View>;
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

  const MainContent = () => (
    <>
        <View style={styles.header}>
            <Text style={styles.headerTitle}>{topicData.topic.title}</Text>
            <Text style={styles.headerDescription}>{topicData.topic.description}</Text>
        </View>
        
        <View style={[
            styles.contentLayout, 
            isLargeScreen ? styles.rowLayout : styles.columnLayout
        ]}>
            {/* --- SECCIÓN 1: EPÍGRAFES --- */}
            {/* CORRECCIÓN: Aquí es donde aplicamos el estilo condicional para quitar el flex:1 en móvil */}
            <View style={[styles.sectionContainer, isLargeScreen && styles.sectionContainerWeb]}>
                <View style={styles.sectionHeader}>
                    <View style={styles.iconBox}>
                        <Ionicons name="list" size={20} color={COLORS.primary} />
                    </View>
                    <Text style={styles.sectionTitle}>{t("headings")}</Text>
                </View>

                <ListWrapper>
                    {topicData.epigraphs && topicData.epigraphs.length > 0 ? (
                        topicData.epigraphs.map((item) => (
                        <StyledButton 
                            style={styles.epigraphCard} 
                            key={`epigraph-${item.id}`} 
                            onPress={() => handleEpigraphPress(item)}
                        >
                            <Text style={styles.epigraphTitle}>{item.name}</Text>
                            <Ionicons name="chevron-forward-circle" size={24} color={COLORS.primary} style={{ opacity: 0.6 }} />
                        </StyledButton>
                        ))
                    ) : (
                        <Text style={styles.emptyText}>{t("no_headings")}</Text>
                    )}
                </ListWrapper>
            </View>

            {/* --- SECCIÓN 2: CONCEPTOS --- */}
            <View style={[styles.sectionContainer, isLargeScreen && styles.sectionContainerWeb]}>
                <View style={styles.sectionHeader}>
                    <View style={styles.iconBox}>
                        <Ionicons name="bulb" size={20} color={COLORS.primary} />
                    </View>
                    <Text style={styles.sectionTitle}>{t("concepts")}</Text>
                </View>
                
                <ListWrapper>
                    {topicData.concepts && topicData.concepts.length > 0 ? (
                        topicData.concepts.map((item) => (
                        <StyledButton 
                            key={`concept-${item.id}`} 
                            onPress={() => handleConceptPress(item)}
                            variant="secondary" // Fondo blanco con borde sutil
                            style={styles.conceptCard} 
                            // Eliminamos padding del StyledButton base para controlarlo nosotros
                            // o dejamos que StyledButton lo maneje y ajustamos internamente.
                            // En este caso, el style 'conceptCard' añade la personalización.
                        >
                            <View style={styles.cardContentWrapper}>
                                <View style={styles.cardHeader}>
                                    <Text style={styles.itemTitle} numberOfLines={2}>
                                        {item.name}
                                    </Text>
                                    
                                    {item.related_concepts && item.related_concepts.length > 0 && (
                                        <View style={styles.badge}>
                                            <Ionicons name="git-network-outline" size={12} color={COLORS.primary} style={{ marginRight: 4 }} />
                                            <Text style={styles.badgeText}>{item.related_concepts.length}</Text>
                                        </View>
                                    )}
                                </View>
                                
                                <Text style={styles.itemSubtitle} numberOfLines={2}>
                                    {item.description}
                                </Text>
                            </View>
                        </StyledButton>
                        ))
                    ) : (
                        <Text style={styles.emptyText}>{t("no_concepts")}</Text>
                    )}
                </ListWrapper>
            </View>
        </View>
    </>
  );

  return (
    <View style={styles.mainContainer}>
        {isLargeScreen ? (
            <View style={styles.webContainer}>
                <View style={styles.centeredWrapperWeb}>
                    <MainContent />
                </View>
            </View>
        ) : (
            <ScrollView 
                style={{ flex: 1, width: '100%' }}
                contentContainerStyle={styles.scrollContentMobile}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.centeredWrapperMobile}> 
                    <MainContent />
                </View>
            </ScrollView>
        )}

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
  
  webContainer: {
    flex: 1,
    height: '100%', 
    overflow: 'hidden', 
  },
  centeredWrapperWeb: {
    flex: 1,
    width: '100%',
    maxWidth: 1200, 
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 20, 
    alignSelf: 'center',
    minHeight: 0, 
  },
  
  sectionContainerWeb: {
     flex: 1,
     height: '100%', 
     overflow: 'hidden',
  },

  centeredWrapperMobile: {
    width: '100%',
    maxWidth: 600, 
    alignSelf: 'center',
  },
  scrollContentMobile: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
    alignItems: 'center',
  },
  
  contentLayout: {
    flex: 1, 
    width: '100%',
    minHeight: 0,
  },
  columnLayout: {
    flexDirection: 'column',
  },
  rowLayout: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    height: '100%', 
    gap: 24, 
  },
  
  sectionContainer: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
  },

  header: {
    marginBottom: 30, 
    alignItems: 'center',
    flexShrink: 0, 
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "800",
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 10,
    letterSpacing: -0.5,
  },
  headerDescription: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    maxWidth: 600,
    lineHeight: 24,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    gap: 12,
    flexShrink: 0, 
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
    letterSpacing: 0.5,
  },

  epigraphCard: {
    backgroundColor: COLORS.surface,
    padding: 18,
    borderRadius: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    borderWidth: 1,
    borderColor: COLORS.border,
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
  epigraphTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    flex: 1,
  },

  conceptCard: {
    marginBottom: 12,
    width: '100%',
    justifyContent: 'flex-start', // Alineación importante para StyledButton
    paddingHorizontal: 16,
    paddingVertical: 16,
    // El borde izquierdo de acento
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
    // Aseguramos que el botón no centre el contenido horizontalmente por defecto
    alignItems: 'stretch', 
  },
  cardContentWrapper: {
    width: '100%',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start', // Alineación superior por si el título tiene 2 líneas
    marginBottom: 6,
  },
  itemTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: COLORS.text,
    flex: 1, // CLAVE: Esto permite que el texto se encoja si es necesario
    marginRight: 10, // Espacio entre título y badge
  },
  itemSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryVeryLight, // Fondo suave (cyan-100)
    borderRadius: 12, // Más redondeado
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexShrink: 0, // CLAVE: Impide que el badge se aplaste
    borderWidth: 1,
    borderColor: COLORS.primaryLight,
  },
  badgeText: {
    color: COLORS.primary, // Texto oscuro (cyan-700/800)
    fontSize: 12,
    fontWeight: '800',
  },
  
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.overlay,
  },
  loadingText: { marginTop: 10, color: COLORS.textLight },
  emptyText: {
    fontStyle: 'italic',
    color: COLORS.textLight,
    textAlign: 'center',
    marginTop: 20,
  },
});