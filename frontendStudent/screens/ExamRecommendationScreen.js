import React from "react";
import { View, Text, ScrollView, StyleSheet, Platform } from "react-native";
import { useLanguage } from "../context/LanguageContext";
import { StyledButton } from "../components/StyledButton";
import { useNavigation } from "@react-navigation/native";

export const ExamRecommendationsScreen = ({ route }) => {
  const { t } = useLanguage();
  const navigation = useNavigation();
  const { code, recommendations, score, total } = route.params;

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
    backgroundColor: '#f0f9ff', // sky-50
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0f172a',
    marginTop: 40,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 24,
    textAlign: 'center',
  },
  card: {
    width: '100%',
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 16,
    flex: 1,
    marginBottom: 20,
    ...(Platform.OS === 'web'
      ? { boxShadow: '0px 4px 6px -1px rgba(0, 0, 0, 0.1)' }
      : {
          shadowColor: '#000',
          shadowOpacity: 0.1,
          shadowRadius: 5,
          elevation: 3,
        }),
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 8,
  },
  bullet: {
    fontSize: 20,
    marginRight: 10,
    color: '#0ea5e9',
    fontWeight: 'bold',
  },
  recText: {
    fontSize: 16,
    flex: 1,
    color: '#334155',
    lineHeight: 24,
  },
  italicText: {
    fontSize: 16,
    fontStyle: 'italic',
    textAlign: 'center',
    color: '#94a3b8',
  },
  finishButton: {
    backgroundColor: '#22c55e', // green-500
    padding: 16,
    borderRadius: 10,
    width: '100%',
    marginBottom: 20,
  },
});