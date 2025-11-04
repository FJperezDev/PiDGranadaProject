import { View, Text } from "react-native";
import {useLanguage} from "../context/LanguageContext";
import { StyledButton } from "../components/StyledButton";

export const ExamResultScreen = ({ setPage, params }) => {
  const { t } = useLanguage();
  const { score, total, recommendations } = params;

  return (
    <View style={{ flex: 1, alignItems: 'center', width: '100%', maxWidth: 800, alignSelf: 'center', padding: 20 }}>
      <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#000', marginTop: 40 }}>{t('results')}</Text>
      <Text style={{ fontSize: 36, fontWeight: 'bold', marginVertical: 24 }}>{`${t('score')}: ${score} / ${total}`}</Text>

      <View style={{ width: '100%', backgroundColor: 'white', padding: 24, borderRadius: 10, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5 }}>
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
          <Text style={{ fontSize: 16, fontStyle: 'italic' }}>¡Felicidades! No hay recomendaciones.</Text>
        )}
      </View>

      <StyledButton 
        title={t('leaveGroup')} 
        onClick={() => setPage({ name: 'Home' })} // Vuelve al inicio
        className="mt-10"
        style={{ backgroundColor: '#a7f3d0' }} // Un verde claro para el botón de finalizar
      />
    </View>
  );
};
