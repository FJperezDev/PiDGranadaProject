import {useLanguage} from "../context/LanguageContext";
import { useState } from 'react';
import { mockApi } from '../services/api';

export const TopicDetailScreen = ({ setPage, params }) => {
  const { t } = useLanguage();
  const { topic } = params;
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
    <button
      className="bg-white p-5 rounded-lg mb-4 w-full text-left shadow border border-cyan-50 transition hover:shadow-lg"
      key={item.id}
      onClick={() => showContent(item)}
    >
      <h3 className="text-lg font-semibold text-black">{item.name}</h3>
      {type === 'heading' && <p className="text-sm text-gray-700 mt-1">{item.description}</p>}
    </button>
  );

  if (isLoading) {
    return <div className="flex-1 flex items-center justify-center"><p>{t('loading')}</p></div>;
  }

  return (
    <div className="flex-1 w-full max-w-3xl mx-auto p-5 overflow-y-auto">
      <h3 className="text-xl font-bold mt-6 mb-3 text-black">{t('concepts')}</h3>
      {details.concepts.map(item => renderItem(item, 'concept'))}
      
      <h3 className="text-xl font-bold mt-6 mb-3 text-black">{t('headings')}</h3>
      {details.headings.map(item => renderItem(item, 'heading'))}

      <ContentModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title={modalContent.title}
        content={modalContent.content}
      />
    </div>
  );
};