import { useEffect } from "react";
import { View, Text, ScrollView, StyleSheet, Platform } from "react-native";
import { useLanguage } from "../context/LanguageContext";
import { StyledButton } from "../components/StyledButton";
import { useNavigation } from "@react-navigation/native";
import { useVoiceControl } from "../context/VoiceContext";
import { useIsFocused } from "@react-navigation/native";
import { COLORS } from "../constants/colors";

export const ExamRecommendationsScreen = ({ route }) => {
  const { t } = useLanguage();
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const { transcript, setTranscript } = useVoiceControl();
  const { code, recommendations } = route.params; // score, total tambien disponibles si se necesitan

  const handleFinish = () => {
    navigation.navigate('Subject', { code: code });
  };

  const normalizeText = (text) => {
    return text ? text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim() : "";
  }

  useEffect(() => {
      if (!transcript || !isFocused) return;
  
      const spoken = normalizeText(transcript);
      console.log("Comando oído en Recommendations:", spoken);
  
      if (
          spoken.includes('terminar') || 
          spoken.includes('finalizar') || 
          spoken.includes('asignatura') ||
          spoken.includes('volver') ||
          spoken.includes('atras') ||
          spoken.includes('finish') || 
          spoken.includes('end') ||
          spoken.includes('subject') ||
          spoken.includes('back')
      ) {
          handleFinish();
          setTranscript('');
          return;
      }
  
      if (spoken.includes('inicio') || spoken.includes('home') || spoken.includes('casa')) {
          navigation.navigate('Home');
          setTranscript('');
          return;
      }
  
    }, [transcript, isFocused, navigation, code]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('recommendations')}</Text>
      <Text style={styles.subtitle}>{t('aiAnalysis') || "AI Analysis based on your performance"}</Text>

      <ScrollView style={styles.card}>
        {recommendations && recommendations.length > 0 ? (
          <View>
            {recommendations.map((rec, index) => (
              <View key={index} style={styles.recommendationItem}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.recText}>{rec}</Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.italicText}>{t('norecommendations')}</Text>
        )}
      </ScrollView>

      <StyledButton 
        title={t('endRevision')} 
        onPress={() => navigation.navigate('Subject', { code: code })} 
        style={styles.finishButton} 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    width: '100%',
    maxWidth: 800,
    alignSelf: 'center',
    padding: 20,
    backgroundColor: COLORS.background, // Sustituido #f0f9ff (Slate-50 aprox)
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: 40,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: 24,
    textAlign: 'center',
  },
  card: {
    width: '100%',
    backgroundColor: COLORS.surface,
    padding: 24,
    borderRadius: 16,
    flex: 1,
    marginBottom: 20,
    ...(Platform.OS === 'web'
      ? { boxShadow: '0px 4px 6px -1px rgba(0, 0, 0, 0.1)' }
      : {
          shadowColor: COLORS.shadow,
          shadowOpacity: 0.1,
          shadowRadius: 5,
          elevation: 3,
        }),
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    backgroundColor: COLORS.surfaceHighlight, // Sustituido #f8fafc
    padding: 12,
    borderRadius: 8,
  },
  bullet: {
    fontSize: 20,
    marginRight: 10,
    color: COLORS.primary, // Sustituido #0ea5e9
    fontWeight: 'bold',
  },
  recText: {
    fontSize: 16,
    flex: 1,
    color: COLORS.text,
    lineHeight: 24,
  },
  italicText: {
    fontSize: 16,
    fontStyle: 'italic',
    textAlign: 'center',
    color: COLORS.textLight,
  },
  finishButton: {
    backgroundColor: COLORS.success, // Sustituido green-500
    padding: 16,
    borderRadius: 10,
    width: '100%',
    marginBottom: 20,
  },
});