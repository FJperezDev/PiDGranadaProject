import { useLanguage } from "../context/LanguageContext";
import { Hexagon, ClipboardText } from 'lucide-react-native';
import { StyledButton } from '../components/StyledButton';
import { useNavigation } from '@react-navigation/native';

export const SubjectScreen = ({ params }) => {
  const navigation = useNavigation();
  const { t } = useLanguage();
  const { subjectData } = params;

  const renderTopic = (item) => (
    <button
      key={item.id}
      className="bg-white p-5 rounded-lg mb-4 w-full text-left shadow border border-cyan-50 transition hover:shadow-lg"
      onClick={() => setPage({ name: 'TopicDetail', params: { topic: item } })}
    >
      <h3 className="text-lg font-semibold text-black">{item.name}</h3>
      <p className="text-sm text-gray-700 mt-1">{item.description}</p>
    </button>
  );

  return (
    <View className="flex-1 flex flex-col w-full max-w-3xl mx-auto p-5">
      <Text className="text-2xl font-bold text-black my-5 text-center">{subjectData.name}</Text>

      {/* Lista de Temas */}
      <View className="flex-1 overflow-y-auto mb-4">
        {subjectData.topics.map(renderTopic)}
      </View>

      {/* Botones inferiores */}
      <View className="flex flex-col md:flex-row justify-around w-full py-3 border-t border-slate-300 gap-4">
        <StyledButton
          title={t('hexagonGame')}
          icon={<Hexagon size={20} />}
          onClick={() => navigation.navigate('Home')}
          className="flex-1"
        />
        <StyledButton
          title={t('exam')}
          icon={<ClipboardText size={20} />}
          onClick={() => navigation.navigate('Home')}
          className="flex-1"
        />
      </View>
    </View>
  );
};