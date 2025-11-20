import React, { useContext } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthContext } from '../context/AuthContext';
import AuthNavigator from './AuthNavigator';
import UserHomeScreen from '../screens/TeacherHomeScreen'
import ManageGroupsScreen from '../screens/ManageGroupsScreen'
import GroupDetailScreen from '../screens/GroupDetailScreen'
import ManageQuestionsScreen from '../screens/ManageQuestionsScreen'
import UnauthorizedScreen from '../screens/UnauthorizedScreen'
import { CustomHeader } from '../components/CustomHeader';
import { useLanguage } from '../context/LanguageContext';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { isAuthenticated, isAdmin } = useContext(AuthContext);
  const { t } = useLanguage();
    
  return (
    <Stack.Navigator screenOptions={({ route }) => ({
        header: () => <CustomHeader routeName={route.name} />,
    })}>

      {isAuthenticated ? (
        <>
          <Stack.Screen name="Home" component={UserHomeScreen} options={{ title: t('home') }}/>
          <Stack.Screen name="ManageGroups" component={ManageGroupsScreen} options={{ title: t('manageGroups') }} />
          <Stack.Screen name="GroupDetail" component={GroupDetailScreen} options={({ route }) => ({ title: route.params.group.name_es || t('groupDetail') })}/>
          <Stack.Screen name="ManageQuestions" component={ManageQuestionsScreen} options={{ title: t('manageQuestions') }} />
          <Stack.Screen name="ManageContent" component={UserHomeScreen} options={{ title: t('manageContent') }} />
          <Stack.Screen name="Statistics" component={UserHomeScreen} options={{ title: t('statistics') }} />
          <Stack.Screen name="InviteTeacher" component={UserHomeScreen} options={{ title: t('inviteTeacher') }} />
          <Stack.Screen name="Logs" component={UserHomeScreen} options={{ title: t('logs') }} />
        </>
      ) : 
      (
        <>
        
          <Stack.Screen name="Auth" component={AuthNavigator} />
          <Stack.Screen name="401" component={UnauthorizedScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}
