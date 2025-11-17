import React, { useContext } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthContext } from '../components';
import AuthNavigator from './AuthNavigator';
import UserHomeScreen from '../screens/UserHomeScreen'
import AdminHomeScreen from '../screens/AdminHomeScreen'
import ManageGroupsScreen from '../screens/ManageGroupsScreen'
import GroupDetailScreen from '../screens/GroupDetailScreen'
import UnauthorizedScreen from '../screens/UnauthorizedScreen'
import { CustomHeader } from '../components/CustomHeader';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { isAuthenticated, isAdmin } = useContext(AuthContext);

  return (
    <Stack.Navigator screenOptions={({ route }) => ({
        header: () => <CustomHeader routeName={route.name} />,
    })}>

      {isAuthenticated ? (
        <>
          <Stack.Screen name="Home" component={UserHomeScreen} />
          <Stack.Screen name="ManageGroups" component={ManageGroupsScreen} options={{ title: 'Gestionar Grupos' }} />
          <Stack.Screen name="GroupDetail" component={GroupDetailScreen} options={({ route }) => ({ title: route.params.group.name_es || 'Detalle del Grupo' })}/>
          <Stack.Screen name="ManageQuestions" component={UserHomeScreen} />
          <Stack.Screen name="ManageContent" component={UserHomeScreen} />
          <Stack.Screen name="Statistics" component={UserHomeScreen} />
          <Stack.Screen name="InviteTeacher" component={UserHomeScreen} />
          <Stack.Screen name="Logs" component={UserHomeScreen} />
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
