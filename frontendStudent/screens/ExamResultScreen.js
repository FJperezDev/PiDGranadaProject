import { View, Text, ScrollView, StyleSheet, Platform } from "react-native";
import {useLanguage} from "../context/LanguageContext";
import { StyledButton } from "../components/StyledButton";

export const ExamResultScreen = ({ route, navigation }) => {
  const { t } = useLanguage();
  const { code, score, total, recommendations } = route.params;
  return (
    <View style={{ flex: 1, alignItems: 'center', width: '100%', maxWidth: 800, alignSelf: 'center', padding: 20 }}>
      <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#000', marginTop: 40 }}>{t('results')}</Text>
      <Text style={{ fontSize: 36, fontWeight: 'bold', marginVertical: 24 }}>{`${t('score')}: ${score} / ${total}`}</Text>

      <ScrollView style={[{ width: '100%', backgroundColor: 'white', padding: 24, borderRadius: 10 },
        Platform.OS === 'web'
          ? { boxShadow: '0px 1px 5px rgba(0,0,0,0.1)' }
          : {
              shadowColor: '#000',
              shadowOpacity: 0.1,
              shadowRadius: 5,
              elevation: 3, // Para Android
            }]}>
        <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 16, color: '#000' }}>{t('recommendations')}</Text>
        {recommendations.length > 0 ? (
          <View>
            {recommendations.map((rec, index) => (
              <View key={index} style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 }}>
                <Text style={{ fontSize: 16, marginRight: 8 }}>•</Text>
                <Text style={{ fontSize: 16, flex: 1 }}>{rec}</Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={{ fontSize: 16, fontStyle: 'italic' }}>{t('noRecommendations')}</Text>
        )}
      </ScrollView>

      <StyledButton title={t('endRevision')} onPress={() => navigation.navigate('Subject', { code: code })} style={styles.button} />

    </View>
    
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#a5f3fc',
    padding: 16,
    borderRadius: 10,
    marginTop: 24,
    ...(Platform.OS === 'web'
      ? { boxShadow: '0px 1px 5px rgba(0,0,0,0.1)' }
      : {
          shadowColor: '#000',
          shadowOpacity: 0.1,
          shadowRadius: 5,
          elevation: 3,
        }),
  },
})
