import { Text } from "react-native";
import { StyledButton } from "../components/StyledButton";
import {useLanguage} from "../context/LanguageContext";
import { useState } from 'react';
import { View } from "react-native";
import { StyledTextInput } from "../components/StyledTextInput";
import { CheckSquare, Square } from "lucide-react-native";
import { useNavigation } from '@react-navigation/native';

export const  ExamSetupScreen = ({ route, onGoBack, setAlert }) => {
  const { t } = useLanguage();
  const { topics } = route.params;
  const navigation = useNavigation();

  const [selectedTopics, setSelectedTopics] = useState(
    topics.reduce((acc, topic) => ({ ...acc, [topic.id]: false }), {})
  );
  const [numQuestions, setNumQuestions] = useState('10');

  const toggleTopic = (topicId) => {
    setSelectedTopics(prev => ({ ...prev, [topicId]: !prev[topicId] }));
  };

  const handleGenerate = () => {
    const topics = Object.keys(selectedTopics).filter(id => selectedTopics[id]);
    if (topics.length === 0) {
      setAlert({ title: t('error'), message: t('errorMinTopics') });
      return;
    }
    const nQuestions = parseInt(numQuestions, 10);
    if (isNaN(nQuestions) || nQuestions <= 0) {
      setAlert({ title: t('error'), message: t('errorInvalidQuestions') });
      return;
    }

    navigation.navigate
  };

  return (
    <View className="flex-1 flex flex-col w-full max-w-2xl mx-auto p-5">
      <View className="flex-1 overflow-y-auto">
        <Text className="text-xl font-bold my-5 text-black">{t('selectTopics')}</Text>
        <View className="space-y-3">
          {topics.map(topic => (
            <StyledButton
              key={topic.id}
              className="flex flex-row items-center w-full p-4 bg-white rounded-lg shadow-sm border"
              onClick={() => toggleTopic(topic.id)}
            >
              {selectedTopics[topic.id] ? 
                <CheckSquare size={24} className="text-cyan-500" /> : 
                <Square size={24} className="text-slate-400" />
              }
              <Text className="text-lg ml-3">{topic.name}</Text>
            </StyledButton>
          ))}
        </View>

        <Text className="text-xl font-bold mt-8 mb-4 text-black">{t('numQuestions')}</Text>
        <StyledTextInput
          placeholder="10"
          value={numQuestions}
          onChange={setNumQuestions}
          type="number"
          className="w-full md:w-1/2"
        />
      </View>
      
      <View className="flex flex-row justify-between w-full mt-8 py-4 border-t border-slate-300">
        <StyledButton title={t('back')} onClick={onGoBack} />
        <StyledButton 
          title={t('generateExam')} 
          onClick={handleGenerate} 
          className="bg-cyan-200 hover:bg-cyan-300" 
        />
      </View>
    </View>
  );
};