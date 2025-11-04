import {useLanguage} from "../context/LanguageContext";
import { useState } from 'react';
import { mockApi } from '../services/api';
import { useEffect } from "react";
import { ContentModal } from "../components/ContentModal";
import { StyledButton } from "../components/StyledButton";
import { View, Text } from 'react-native';

export const TopicDetailScreen = ({ setPage, route }) => {
  const { t } = useLanguage();
  const { topic } = route.params;
  const [details, setDetails] = useState({ concepts: [], headings: [] });
  const [isLoading, setIsLoading] = useState(true);
  
  const [modalVisible, setModalVisible] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', content: '' });

  useEffect(() => {
    const fetchDetails = async () => {
      const data = await mockApi.getTopicDetails(topic.id);
      setDetails(data);
      setIsLoading(false);
    };
    fetchDetails();
  }, [topic.id]);

  const showContent = (item) => {
    setModalContent({ title: item.name, content: item.content });
    setModalVisible(true);
  };

  const renderItem = (item, type) => (
    <StyledButton
      className="bg-white p-5 rounded-lg mb-4 w-full text-left shadow border border-cyan-50 transition hover:shadow-lg"
      key={item.id}
      onClick={() => showContent(item)}
    >
      <Text className="text-lg font-semibold text-black">{item.name}</Text>
      {type === 'heading' && <Text className="text-sm text-gray-700 mt-1">{item.description}</Text>}
    </StyledButton>
  );

  if (isLoading) {
    return <View className="flex-1 flex items-center justify-center"><Text>{t('loading')}</Text></View>;
  }

  return (
    <View className="flex-1 w-full max-w-3xl mx-auto p-5 overflow-y-auto">
      <Text className="text-xl font-bold mt-6 mb-3 text-black">{t('concepts')}</Text>
      {details.concepts.map(item => renderItem(item, 'concept'))}
      
      <Text className="text-xl font-bold mt-6 mb-3 text-black">{t('headings')}</Text>
      {details.headings.map(item => renderItem(item, 'heading'))}

      <ContentModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title={modalContent.title}
        content={modalContent.content}
      />
    </View>
  );
};