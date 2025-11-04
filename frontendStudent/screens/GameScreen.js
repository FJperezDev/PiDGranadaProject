import {useLanguage} from "../context/LanguageContext";
import { useState } from 'react';
import { mockApi } from '../services/api';

export const GameScreen = ({ setPage }) => {
  const { t } = useLanguage();
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [currentQ, setCurrentQ] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    mockApi.getGameQuestions().then(data => {
      setQuestions(data);
      setIsLoading(false);
    });
  }, []);

  const handleSelectAnswer = (questionId, answer) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleNext = () => {
    if (currentQ < questions.length - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      setPage({ name: 'GameResult' });
    }
  };

  const handlePrev = () => {
    if (currentQ > 0) {
      setCurrentQ(currentQ - 1);
    }
  };
  
  if (isLoading) return <div className="flex-1 flex items-center justify-center"><p>{t('loadingGame')}</p></div>;
  
  const question = questions[currentQ];
  const selectedAnswer = answers[question.id];

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-5 w-full max-w-2xl mx-auto">
      <p className="text-slate-500 absolute top-28 md:top-24 right-5">{`${currentQ + 1} / ${questions.length}`}</p>
      <p className="text-2xl font-medium text-center my-10">{question.text}</p>
      
      <div className="w-full">
        {question.options.map(opt => (
          <button
            key={opt}
            className={`w-full p-4 mb-4 rounded-lg border-2 text-lg text-center
              ${selectedAnswer === opt 
                ? 'bg-cyan-100 border-cyan-300' 
                : 'bg-white border-slate-300 hover:bg-slate-100'}`}
            onClick={() => handleSelectAnswer(question.id, opt)}
          >
            {opt}
          </button>
        ))}
      </div>

      <div className="flex flex-row justify-between w-full mt-8">
        <StyledButton title={t('previous')} onClick={handlePrev} disabled={currentQ === 0} />
        <StyledButton 
          title={currentQ === questions.length - 1 ? t('finishExam') : t('next')} 
          onClick={handleNext}
          className={currentQ === questions.length - 1 ? 'bg-green-500 hover:bg-green-600' : 'bg-cyan-200 hover:bg-cyan-300'}
        />
      </div>
    </div>
  );
};