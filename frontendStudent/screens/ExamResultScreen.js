import {useLanguage} from "../context/LanguageContext";

export const ExamResultScreen = ({ setPage, params }) => {
  const { t } = useLanguage();
  const { score, total, recommendations } = params;

  return (
    <div className="flex-1 flex flex-col items-center w-full max-w-2xl mx-auto p-5 overflow-y-auto">
      <h2 className="text-3xl font-bold text-black mt-10">{t('results')}</h2>
      <p className="text-4xl font-bold my-6">{`${t('score')}: ${score} / ${total}`}</p>

      <div className="w-full bg-white p-6 rounded-lg shadow">
        <h3 className="text-xl font-bold mb-4 text-black">{t('recommendations')}</h3>
        {recommendations.length > 0 ? (
          <ul className="list-disc list-inside space-y-2">
            {recommendations.map((rec, index) => (
              <li key={index} className="text-base">{rec}</li>
            ))}
          </ul>
        ) : (
          <p className="text-base italic">¡Felicidades! No hay recomendaciones.</p>
        )}
      </div>

      <StyledButton 
        title={t('leaveGroup')} 
        onClick={() => setPage({ name: 'Home' })} // Vuelve al inicio
        className="mt-10 bg-cyan-200 hover:bg-cyan-300"
      />
    </div>
  );
};
