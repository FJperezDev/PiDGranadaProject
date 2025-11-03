import {useLanguage} from '../context/LanguageContext';
import { LanguageSwitcher } from './LanguageSwitcher';
import { ChevronLeft, BookMarked } from 'lucide-react-native';


export const CustomHeader = ({ page, onGoBack }) => {
  const { t } = useLanguage();
  const routeName = page.name;

  return (
    <div className="w-full flex flex-row items-center justify-between bg-cyan-50 p-4 shadow-sm border-b border-slate-300">
      <div className="flex-1">
        {routeName === 'Home' ? (
          <BookMarked size={32} className="text-black" />
        ) : (
          <button onClick={onGoBack} className="p-2">
            <ChevronLeft size={32} className="text-black" />
          </button>
        )}
      </div>
      
      <div className="flex-2 text-center">
        <h1 className="text-xl font-bold text-black">{t('appName')}</h1>
      </div>
      
      <div className="flex-1 flex justify-end">
        <LanguageSwitcher />
      </div>
    </div>
  );
};