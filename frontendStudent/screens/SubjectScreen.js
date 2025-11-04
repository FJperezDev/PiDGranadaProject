import { useLanguage } from "../context/LanguageContext";
import { useNavigation } from '@react-navigation/native';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { StyledButton } from "../components/StyledButton";
import { Hexagon, Clipboard } from 'lucide-react-native';

export const SubjectScreen = ({ route }) => {
  const navigation = useNavigation();
  const { t } = useLanguage();
  const { subjectData } = route.params;

  const renderItem = ({ item }) => (
    <TouchableOpacity
      key={item.id}
      style={{
        backgroundColor: 'white',
        padding: 16,
        borderRadius: 10,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#e0f7fa',
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 5,
      }}
      
      onPress={() => {
        navigation.navigate('TopicDetail', { topic: item });
      }}
    >
      <Text style={{ fontSize: 18, fontWeight: '600', color: '#000' }}>
        {item.name}
      </Text>
      <Text style={{ fontSize: 14, color: '#555', marginTop: 4 }}>
        {item.description}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, width: '100%', maxWidth: 800, alignSelf: 'center', padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#000', textAlign: 'center', marginVertical: 20 }}>
        {subjectData.name}
      </Text>

      <FlatList
        data={subjectData.topics}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
      />
      {/* Botones inferiores */}
      <View className="flex flex-col md:flex-row justify-around w-full py-3 border-t border-slate-300 gap-4"> 
        <StyledButton title={t('hexagonGame')} icon={<Hexagon size={20} />} onClick={() => navigation.navigate('Game')} className="flex-1" /> 
        <StyledButton title={t('exam')} icon={<Clipboard size={20} />} onClick={() => navigation.navigate('Exam', { topics: subjectData.topics })} className="flex-1" /> 
      </View>
    </View>
  );
};
