import React, { useContext } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthContext } from '../components';
import AuthNavigator from './AuthNavigator';
import { UserHomeScreen, AdminHomeScreen, UnauthorizedScreen, CheckoutScreen } from '../screens';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { isAuthenticated, isAdmin } = useContext(AuthContext);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAdmin ? (
        <Stack.Screen name="Home" component={AdminHomeScreen} />
      ) : 
      isAuthenticated ? (
        <>
          <Stack.Screen name="Home" component={UserHomeScreen} />
          <Stack.Screen name="Checkout" component={CheckoutScreen} /> 
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
