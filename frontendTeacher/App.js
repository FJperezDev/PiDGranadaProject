// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider } from './context/AuthContext';
import { AppNavigator } from './navigation';
import { ActivityIndicator, View } from 'react-native';
import { CustomHeader } from './components/CustomHeader';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from './constants/colors';
import { LanguageProvider } from './context/LanguageContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const App = () => {

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <LanguageProvider>
          <AuthProvider>
            <NavigationContainer>
              <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']} backgroundColor={COLORS.primary}>
                <AppNavigator />
              </SafeAreaView>
            </NavigationContainer>
          </AuthProvider>
        </LanguageProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

export default App;
