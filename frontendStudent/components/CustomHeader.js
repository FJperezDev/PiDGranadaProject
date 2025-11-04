import {useLanguage} from '../context/LanguageContext';
import { LanguageSwitcher } from './LanguageSwitcher';
import { ChevronLeft, BookMarked } from 'lucide-react-native';
import { StyledButton } from './StyledButton';


export const CustomHeader = ({ page, onGoBack }) => {
  const { t } = useLanguage();
  const routeName = page.name;

  return (
    <View className="w-full flex flex-row items-center justify-between bg-cyan-50 p-4 shadow-sm border-b border-slate-300">
      <View className="flex-1">
        {routeName === 'Home' ? (
          <BookMarked size={32} className="text-black" />
        ) : (
          <StyledButton onClick={onGoBack} className="p-2">
            <ChevronLeft size={32} className="text-black" />
          </StyledButton>
        )}
      </View>
      
      <View className="flex-2 text-center">
        <Text className="text-xl font-bold text-black">{t('appName')}</Text>
      </View>
      
      <View className="flex-1 flex justify-end">
        <LanguageSwitcher />
      </View>
    </View>
  );
};