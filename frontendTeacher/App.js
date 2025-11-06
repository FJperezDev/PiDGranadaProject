import { useState } from 'react';
import { LanguageProvider } from './context/LanguageContext';
import {useLanguage} from './context/useLanguage';
import {HomeScreen} from './screens/HomeScreen';
import {SubjectScreen} from './screens/SubjectScreen';
import {TopicDetailScreen} from './screens/TopicDetailScreen';
import {GameScreen} from './screens/GameScreen';
import {GameResultScreen} from './screens/GameResultScreen';
import {ExamSetupScreen} from './screens/ExamSetupScreen';
import {ExamScreen} from './screens/ExamScreen';
import {ExamResultScreen} from './screens/ExamResultScreen';
import {CustomHeader} from './components/CustomHeader';
import {AlertModal} from './components/AlertModal';
import { View } from 'react-native';

export default function App() {
  // page: { name: 'Home', params: {} }
  const [page, setPage] = useState({ name: 'Home' });
  const [pageHistory, setPageHistory] = useState([]);
  
  // { title: 'Error', message: '...' }
  const [alertInfo, setAlertInfo] = useState({ title: '', message: '', visible: false, allowBack: true });

  const { t } = useLanguage();

  const handleSetPage = (newPage) => {
    setPageHistory(prev => [...prev, page]);
    setPage(newPage);
  };

  const handleGoBack = () => {
    if (!alertInfo.allowBack) {
      setAlertInfo(prev => ({ 
        ...prev, 
        visible: true, 
        title: t('examInProgress'), 
        message: t('examInProgressMessage') 
      }));
      return;
    }
    
    if (pageHistory.length > 0) {
      const lastPage = pageHistory[pageHistory.length - 1];
      setPageHistory(prev => prev.slice(0, -1));
      setPage(lastPage);
    }
  };
  
  const handleSetAlert = (info) => {
     setAlertInfo(prev => ({ 
        ...prev, 
        visible: true, 
        title: info.title, 
        message: info.message 
      }));
  };
  
  const closeAlert = () => {
    setAlertInfo({ title: '', message: '', visible: false, allowBack: alertInfo.allowBack });
  };
  
  // Renderiza la pantalla actual
  const renderPage = () => {
    const props = {
      setPage: handleSetPage,
      params: page.params,
      onGoBack: handleGoBack,
      setAlert: handleSetAlert,
    };
    
    switch (page.name) {
      case 'Home':
        return <HomeScreen {...props} />;
      case 'Subject':
        return <SubjectScreen {...props} />;
      case 'TopicDetail':
        return <TopicDetailScreen {...props} />;
      case 'Game':
        return <GameScreen {...props} />;
      case 'GameResult':
        return <GameResultScreen {...props} />;
      case 'ExamSetup':
        return <ExamSetupScreen {...props} />;
      case 'Exam':
        return <ExamScreen {...props} />;
      case 'ExamResult':
        return <ExamResultScreen {...props} />;
      default:
        return <HomeScreen {...props} />;
    }
  };

  return (
    <LanguageProvider>
      {/* Contenedor principal de la app */}
      <View className="flex flex-col h-screen w-full bg-slate-50 font-sans">
        <CustomHeader page={page} onGoBack={handleGoBack} />
        
        {/* Contenido de la página */}
        <main className="flex-1 overflow-y-auto">
          {renderPage()}
        </main>
        
        <AlertModal
          visible={alertInfo.visible}
          title={alertInfo.title}
          message={alertInfo.message}
          onClose={closeAlert}
        />
      </View>
    </LanguageProvider>
  );
}