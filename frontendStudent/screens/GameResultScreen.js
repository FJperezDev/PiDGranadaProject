import { Image } from "react-native";
import { StyledButton } from "../components/StyledButton";
import {useLanguage} from "../context/LanguageContext";
import { useState } from 'react';
import { View, Text } from "react-native";

export const GameResultScreen = ({ setPage }) => {
  const { t } = useLanguage();
  const [imageVisible, setImageVisible] = useState(false);
  const [nameVisible, setNameVisible] = useState(false);

  return (
    <View className="flex-1 flex flex-col items-center justify-center p-5">
      <Text className="text-2xl font-bold text-black mb-8">{t('gameResultTitle')}</Text>
      
      {/* Imagen Oculta */}
      <StyledButton 
        onClick={() => setImageVisible(true)}
        className="w-64 h-64 md:w-80 md:h-80 flex items-center justify-center rounded-lg shadow-md"
      >
        {imageVisible ? (
          <Image
            src="https://placehold.co/300x300/E0F7FA/000000?text=Organization+Chart"
            alt="Organization Chart"
            className="w-full h-full object-cover rounded-lg"
          />
        ) : (
          <View className="w-full h-full bg-slate-300 rounded-lg flex items-center justify-center">
            <Text className="text-lg">{t('tapToReveal')}</Text>
          </View>
        )}
      </StyledButton>

      {/* Nombre Oculto */}
      <StyledButton onClick={() => setNameVisible(true)} className="mt-8">
        {nameVisible ? (
          <Text className="text-3xl font-bold">Estructura Matricial</Text>
        ) : (
          <View className="bg-slate-300 rounded-lg flex items-center justify-center py-4 px-8">
            <Text className="text-lg">{t('tapToReveal')}</Text>
          </View>
        )}
      </StyledButton>
    </View>
  );
};