import React, { useContext } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthContext } from '../components';
import AuthNavigator from './AuthNavigator';
import { UserHomeScreen, AdminHomeScreen, UnauthorizedScreen } from '../screens';
import { CustomHeader } from '../components/CustomHeader';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { isAuthenticated, isAdmin } = useContext(AuthContext);

  return (
    <Stack.Navigator screenOptions={({ route }) => ({
        header: () => <CustomHeader routeName={route.name} />,
    })}>

      {isAdmin ? (
        <Stack.Screen name="Home" component={AdminHomeScreen} />
      ) : 
      isAuthenticated ? (
        <>
          <Stack.Screen name="Home" component={UserHomeScreen} />
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
