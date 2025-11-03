import {useLanguage} from "../context/LanguageContext";
import { useState } from 'react';
import { mockApi } from '../services/api';

export const ExamScreen = ({ setPage, params, setAlert }) => {
  const { t } = useLanguage();
  const { topicIds, nQuestions } = params;
  
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [currentQ, setCurrentQ] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
  const [timeLeft, setTimeLeft] = useState(nQuestions * 90);

  // Cargar preguntas
  useEffect(() => {
    mockApi.generateExam(topicIds, nQuestions).then(data => {
      setQuestions(data);
      setIsLoading(false);
    });
  }, [topicIds, nQuestions]);

  const handleFinish = useMemo(() => () => {
    // Calcular resultados
    let score = 0;
    const recommendations = [];
    questions.forEach(q => {
      if (answers[q.id] === q.correctAnswer) {
        score++;
      } else {
        recommendations.push(q.recommendation);
      }
    });

    setPage({ 
      name: 'ExamResult', 
      params: { 
        score, 
        total: questions.length, 
        recommendations: [...new Set(recommendations)]
      }
    });
  }, [questions, answers, setPage]);


  // Timer
  useEffect(() => {
    if (isLoading) return;
    
    if (timeLeft <= 0) {
      handleFinish();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isLoading, handleFinish]);
  
  const handleSelectAnswer = (questionId, answer) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleNext = () => {
    if (currentQ < questions.length - 1) {
      setCurrentQ(currentQ + 1);
    }
  };

  const handlePrev = () => {
    if (currentQ > 0) {
      setCurrentQ(currentQ - 1);
    }
  };


  if (isLoading) return <div className="flex-1 flex items-center justify-center"><p>{t('generatingExam')}</p></div>;

  const question = questions[currentQ];
  const selectedAnswer = answers[question.id];
  
  // Informa al componente `App` que no se puede volver atrás
  useEffect(() => {
    setAlert(prev => ({ ...prev, allowBack: false }));
    return () => setAlert(prev => ({ ...prev, allowBack: true }));
  }, [setAlert]);


  return (
    <div className="flex-1 flex flex-col items-center justify-center p-5 w-full max-w-2xl mx-auto">
      <div className="w-full flex justify-between items-center absolute top-28 md:top-24 px-5">
        <p className="text-slate-500">{`${currentQ + 1} / ${questions.length}`}</p>
        <p className="text-red-700 font-bold text-lg">
          {`${t('timeRemaining')}: ${Math.floor(timeLeft / 60)}:${('0' + (timeLeft % 60)).slice(-2)}`}
        </p>
      </div>
      
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
        {currentQ === questions.length - 1 ? (
          <StyledButton 
            title={t('finishExam')} 
            onClick={handleFinish} 
            className="bg-green-500 hover:bg-green-600" 
          />
        ) : (
          <StyledButton 
            title={t('next')} 
            onClick={handleNext} 
            className="bg-cyan-200 hover:bg-cyan-300"
          />
        )}
      </div>
    </div>
  );
};
