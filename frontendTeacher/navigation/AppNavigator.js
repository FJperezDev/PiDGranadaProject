import React, { useContext } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthContext } from '../context/AuthContext';
import AuthNavigator from './AuthNavigator';
import UserHomeScreen from '../screens/TeacherHomeScreen'
import ManageGroupsScreen from '../screens/ManageGroupsScreen'
import GroupDetailScreen from '../screens/GroupDetailScreen'
import TopicDetailScreen from '../screens/TopicDetailScreen';
import ManageQuestionsScreen from '../screens/ManageQuestionsScreen'
import SubjectTopicsScreen from '../screens/SubjectTopicScreen';
import ManageUsersScreen from '../screens/ManageUsersScreen'
import ManageContentScreen from '../screens/ManageContentScreen'
import BackupManagerScreen from '../screens/BackupManagerScreen'
import AnalyticsScreen from '../screens/AnalyticsScreen'
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
          <Stack.Screen name="SubjectTopics" component={SubjectTopicsScreen} options={{ title: t('subjectTopics') }} />
          <Stack.Screen name="GroupDetail" component={GroupDetailScreen} options={({ route }) => ({ title: route.params.group.name_es || t('groupDetail') })}/>
          <Stack.Screen name="ManageQuestions" component={ManageQuestionsScreen} options={{ title: t('manageQuestions') }} />
          <Stack.Screen name="ManageContent" component={ManageContentScreen} options={{ title: t('manageContent') }} />
          <Stack.Screen name="BackupManager" component={BackupManagerScreen} options={{ title: t('backupManager') }} />
          <Stack.Screen name="TopicDetail" component={TopicDetailScreen} options={({ route }) => ({ title: t('topicDetail') })} />
          <Stack.Screen name="Analytics" component={AnalyticsScreen} options={{ title: t('analytics') }} />
          <Stack.Screen name="InviteTeacher" component={ManageUsersScreen} options={{ title: t('inviteTeacher') }} />
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
