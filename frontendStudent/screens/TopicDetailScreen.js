import { useLanguage } from "../context/LanguageContext";
import { useState, useEffect, useRef } from "react";
import { mockApi } from "../services/api";
import { ContentModal } from "../components/ContentModal";
import { StyledButton } from "../components/StyledButton";
import { View, Text, StyleSheet, ScrollView, Platform } from "react-native";
import { COLORS } from "../constants/colors";

export const TopicDetailScreen = ({ setPage, route }) => {
  const { t, language } = useLanguage();
  const [details, setDetails] = useState({ concepts: [], epigraphs: [] });
  const [isLoading, setIsLoading] = useState(true);

  const [modalVisible, setModalVisible] = useState(false);
  const [modalContent, setModalContent] = useState({ title: "", content: "" });

  const { topic } = route.params;
  const didMountRef = useRef(false);

  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true;
      return;
    }

    const fetchData = async () => {
      try {
        const response = await mockApi.getTopicDetails(topic.name);
        setDetails(response);
      } catch (error) {
        console.error("Error actualizando los datos de la asignatura: ", error);
      }
    };

    fetchData();
  }, [language]);

  useEffect(() => {
    const fetchDetails = async () => {
      const data = await mockApi.getTopicDetails(topic.name, t("languageCode"));
      setDetails(data);
      setIsLoading(false);
    };
    fetchDetails();
  }, [topic.id]);

  const showContent = (item) => {
    setModalContent({ title: item.name, content: item.description });
    setModalVisible(true);
  };

  const renderItem = (item) => (
    <StyledButton style={styles.button} key={item.id} onPress={() => showContent(item)}>
      <Text style={styles.itemTitle}>{item.name}</Text>
      <Text style={styles.itemSubtitle}>{item.summary}</Text>
    </StyledButton>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>{t("loading")}</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.sectionTitle}>{t("concepts")}</Text>
      {details.concepts.map(renderItem)}

      <Text style={styles.sectionTitle}>{t("headings")}</Text>
      {details.epigraphs.map(renderItem)}

      <ContentModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title={modalContent.title}
        content={modalContent.content}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: COLORS.secondary || "#fff",
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.primary || "#e0f7fa",
    ...(Platform.OS === 'web'
      ? { boxShadow: '0px 1px 5px rgba(0,0,0,0.1)' }
      : {
          shadowColor: COLORS.black || "#000",
          shadowOpacity: 0.1,
          shadowRadius: 5,
          elevation: 2,
        }),
  },
  container: {
    flexGrow: 1,
    width: "100%",
    maxWidth: 800,
    alignSelf: "center",
    padding: 20,
    backgroundColor: COLORS.background || "#fff",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.background || "#fff",
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.text || "#000",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.black || "#000",
    marginTop: 24,
    marginBottom: 12,
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.black || "#000",
  },
  itemSubtitle: {
    fontSize: 14,
    color: COLORS.secondary || "#444",
    marginTop: 4,
  },
});
