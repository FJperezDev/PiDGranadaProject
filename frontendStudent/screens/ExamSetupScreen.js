import {useLanguage} from "../context/LanguageContext";
import { useState } from 'react';

export const  ExamSetupScreen = ({ setPage, params, onGoBack, setAlert }) => {
  const { t } = useLanguage();
  const { topics } = params;
  
  const [selectedTopics, setSelectedTopics] = useState(
    topics.reduce((acc, topic) => ({ ...acc, [topic.id]: false }), {})
  );
  const [numQuestions, setNumQuestions] = useState('10');

  const toggleTopic = (topicId) => {
    setSelectedTopics(prev => ({ ...prev, [topicId]: !prev[topicId] }));
  };

  const handleGenerate = () => {
    const topicIds = Object.keys(selectedTopics).filter(id => selectedTopics[id]);
    if (topicIds.length === 0) {
      setAlert({ title: t('error'), message: t('errorMinTopics') });
      return;
    }
    const nQuestions = parseInt(numQuestions, 10);
    if (isNaN(nQuestions) || nQuestions <= 0) {
      setAlert({ title: t('error'), message: t('errorInvalidQuestions') });
      return;
    }

    setPage({ name: 'Exam', params: { topicIds, nQuestions } });
  };

  return (
    <div className="flex-1 flex flex-col w-full max-w-2xl mx-auto p-5">
      <div className="flex-1 overflow-y-auto">
        <h3 className="text-xl font-bold my-5 text-black">{t('selectTopics')}</h3>
        <div className="space-y-3">
          {topics.map(topic => (
            <button
              key={topic.id}
              className="flex flex-row items-center w-full p-4 bg-white rounded-lg shadow-sm border"
              onClick={() => toggleTopic(topic.id)}
            >
              {selectedTopics[topic.id] ? 
                <CheckSquare size={24} className="text-cyan-500" /> : 
                <Square size={24} className="text-slate-400" />
              }
              <span className="text-lg ml-3">{topic.name}</span>
            </button>
          ))}
        </div>

        <h3 className="text-xl font-bold mt-8 mb-4 text-black">{t('numQuestions')}</h3>
        <StyledTextInput
          placeholder="10"
          value={numQuestions}
          onChange={setNumQuestions}
          type="number"
          className="w-full md:w-1/2"
        />
      </div>
      
      <div className="flex flex-row justify-between w-full mt-8 py-4 border-t border-slate-300">
        <StyledButton title={t('back')} onClick={onGoBack} />
        <StyledButton 
          title={t('generateExam')} 
          onClick={handleGenerate} 
          className="bg-cyan-200 hover:bg-cyan-300" 
        />
      </div>
    </div>
  );
};