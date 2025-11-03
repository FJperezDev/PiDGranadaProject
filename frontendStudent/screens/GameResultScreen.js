import {useLanguage} from "../context/LanguageContext";
import { useState } from 'react';

export const GameResultScreen = ({ setPage }) => {
  const { t } = useLanguage();
  const [imageVisible, setImageVisible] = useState(false);
  const [nameVisible, setNameVisible] = useState(false);

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-5">
      <h2 className="text-2xl font-bold text-black mb-8">{t('gameResultTitle')}</h2>
      
      {/* Imagen Oculta */}
      <button 
        onClick={() => setImageVisible(true)}
        className="w-64 h-64 md:w-80 md:h-80 flex items-center justify-center rounded-lg shadow-md"
      >
        {imageVisible ? (
          <img
            src="https://placehold.co/300x300/E0F7FA/000000?text=Organization+Chart"
            alt="Organization Chart"
            className="w-full h-full object-cover rounded-lg"
          />
        ) : (
          <div className="w-full h-full bg-slate-300 rounded-lg flex items-center justify-center">
            <p className="text-lg">{t('tapToReveal')}</p>
          </div>
        )}
      </button>

      {/* Nombre Oculto */}
      <button onClick={() => setNameVisible(true)} className="mt-8">
        {nameVisible ? (
          <p className="text-3xl font-bold">Estructura Matricial</p>
        ) : (
          <div className="bg-slate-300 rounded-lg flex items-center justify-center py-4 px-8">
            <p className="text-lg">{t('tapToReveal')}</p>
          </div>
        )}
      </button>
    </div>
  );
};