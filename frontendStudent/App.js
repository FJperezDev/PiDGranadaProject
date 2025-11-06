import { LanguageProvider } from './context/LanguageContext';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from './screens/HomeScreen';
import { SubjectScreen } from './screens/SubjectScreen';
import { TopicDetailScreen } from './screens/TopicDetailScreen';
import { GameScreen } from './screens/GameScreen';
import { GameResultScreen } from './screens/GameResultScreen';
import { ExamSetupScreen } from './screens/ExamSetupScreen';
import { ExamScreen } from './screens/ExamScreen';
import { ExamResultScreen } from './screens/ExamResultScreen';
import { CustomHeader } from './components/CustomHeader';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from './constants/colors';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <LanguageProvider>
        <NavigationContainer>
          <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']} backgroundColor={COLORS.primary}>
            <Stack.Navigator
              initialRouteName="Home"
              screenOptions={({ route }) => ({
                header: () => <CustomHeader routeName={route.name} />,
              })}
            >
              <Stack.Screen name="Home" component={HomeScreen} />
              <Stack.Screen name="Subject" component={SubjectScreen} />
              <Stack.Screen name="TopicDetail" component={TopicDetailScreen} />
              <Stack.Screen name="Game" component={GameScreen} />
              <Stack.Screen name="GameResult" component={GameResultScreen} />
              <Stack.Screen name="ExamSetup" component={ExamSetupScreen} />
              <Stack.Screen name="Exam" component={ExamScreen} />
              <Stack.Screen name="ExamResult" component={ExamResultScreen} /> 
            </Stack.Navigator>
          </SafeAreaView>
        </NavigationContainer>
      </LanguageProvider>
    </SafeAreaProvider>
      
  );
}
