import { useLanguage } from "../context/LanguageContext";
import { useState, useEffect } from "react";
import { mockApi } from "../services/api";
import { ContentModal } from "../components/ContentModal";
import { ConceptModal } from "../components/ConceptModal"; // Tu nuevo modal
import { StyledButton } from "../components/StyledButton";
import { View, Text, StyleSheet, ScrollView, Platform, ActivityIndicator } from "react-native";
import { COLORS } from "../constants/colors";
import { Ionicons } from '@expo/vector-icons'; 

export const TopicDetailScreen = ({ route }) => {
  const { t, language } = useLanguage();
  const [conceptData, setConceptData] = useState(null); 
  const [topicData, setTopicData] = useState(null); 
  const [isLoading, setIsLoading] = useState(true);

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

  useEffect(() => {
    fetchTopicDetails();
  }, [topic, language]);

  // Manejador para Epígrafes
  const handleEpigraphPress = (item) => {
    setEpigraphContent({ title: item.name, content: item.description });
    setEpigraphModalVisible(true);
  };

  // Manejador para abrir un concepto desde la lista principal
  const handleConceptPress = (concept) => {
    setSelectedConcept(concept);
    setConceptModalVisible(true);
  };

  /**
   * Manejador de navegación dentro del Modal
   * Recibe el concepto relacionado (puede ser un objeto parcial {id, name} o un string)
   * Busca la información completa en topicData.concepts y cambia el modal.
   */
  const handleRelatedConceptNavigation = (target) => {
    if (!topicData || !topicData.concepts) return;

    let foundConcept = null;
    // Buscamos el concepto completo en la lista que ya tenemos en memoria
    if (typeof target === 'object' && target.id) {
       // Si tenemos ID, es la búsqueda más segura
       foundConcept = conceptData.find(c => c.id === target.id);
    } else if (typeof target === 'object' && target.name) {
       // Si solo tenemos name en el objeto
       foundConcept = conceptData.find(c => c.name === target.name);
    } else if (typeof target === 'string') {
       // Si es solo un string
       foundConcept = conceptData.find(c => c.name === target);
    }

    if (foundConcept) {
      // "Cerramos" el actual y abrimos el nuevo reemplazando el selectedConcept
      // Como React actualiza el estado, visualmente es un cambio instantáneo de contenido
      setSelectedConcept(foundConcept);
    } else {
      console.warn("Concepto relacionado no encontrado en la lista actual:", target);
      // Opcional: Podrías mostrar una alerta de que no hay más info de ese concepto
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary || "#000"} />
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
    

    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.headerTitle}>{topicData.topic.title}</Text>
      <Text style={styles.headerDescription}>{topicData.topic.description}</Text>

      {/* SECCIÓN CONCEPTOS */}
      <View style={styles.sectionHeader}>
        <Ionicons name="bulb" size={20} color={COLORS.primary || "#000"} />
        <Text style={styles.sectionTitle}>{t("concepts")}</Text>
      </View>
      
      {topicData.concepts && topicData.concepts.length > 0 ? (
        topicData.concepts.map((item) => (
          <StyledButton 
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
              {/* Badge de relaciones */}
              {item.related_concepts && item.related_concepts.length > 0 && (
                <View style={styles.badge}>
                  <Ionicons name="git-network-outline" size={14} color="#fff" />
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
        <Ionicons name="list" size={20} color={COLORS.primary || "#000"} />
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
              {item.order_id}. {item.name}
            </Text>
            <Ionicons name="chevron-forward" size={18} color={COLORS.secondary || "#999"} />
          </StyledButton>
        ))
      ) : (
        <Text style={styles.emptyText}>{t("no_headings")}</Text>
      )}

      {/* Modal Simple (Epígrafes) */}
      <ContentModal
        visible={epigraphModalVisible}
        onClose={() => setEpigraphModalVisible(false)}
        title={epigraphContent.title}
        content={epigraphContent.content}
      />

      {/* Modal Complejo (Conceptos) */}
      <ConceptModal
        visible={conceptModalVisible}
        onClose={() => setConceptModalVisible(false)}
        concept={selectedConcept}
        t={t}
        // Pasamos la función de navegación
        onRelatedPress={handleRelatedConceptNavigation}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  // ... (Tus estilos anteriores se mantienen igual, no hace falta cambiarlos)
  container: {
    flexGrow: 1,
    width: "100%",
    maxWidth: 800,
    alignSelf: "center",
    padding: 20,
    paddingBottom: 40,
    backgroundColor: COLORS.background || "#f4f6f8",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: COLORS.black,
    textAlign: 'center',
    marginBottom: 8,
  },
  headerDescription: {
    fontSize: 16,
    color: COLORS.text || "#555",
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 10,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  loadingText: {
    color: COLORS.secondary || "#666",
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 12,
    gap: 8,
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.text || "#333",
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  cardButton: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.03)",
    ...Platform.select({
      web: { boxShadow: '0px 2px 8px rgba(0,0,0,0.05)' },
      default: {
        shadowColor: "#000",
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
  },
  cardTextContainer: {
    flex: 1,
    marginRight: 10,
  },
  itemTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: COLORS.text || "#000",
    marginBottom: 4,
  },
  itemSubtitle: {
    fontSize: 14,
    color: COLORS.secondary || "#666",
    lineHeight: 18,
  },
  badge: {
    backgroundColor: COLORS.primary || "#007bff",
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  epigraphCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
  },
  epigraphTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: COLORS.text || "#333",
  },
  emptyText: {
    fontStyle: 'italic',
    color: '#999',
    textAlign: 'center',
    marginVertical: 10,
  },
});