import React, { useContext, useEffect, useState } from "react";
import { View, Text, Button, ScrollView, RefreshControl, Dimensions } from "react-native";
import { AuthContext, UserInfo, UserList } from "../components";
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

export default function AdminHomeScreen() {
  const {
    logout,
    logoutAll,
    loggedUser,
    onRefresh,
    refreshing,
    users,
  } = useContext(AuthContext);

  useEffect(() => {
    onRefresh();
  }, []);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "center",
            alignItems: "center",
            padding: 20,
          }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <Text style={{ fontSize: 24, marginBottom: 10 }}>Welcome Admin!</Text>

          {loggedUser ? (
            <UserInfo userData={loggedUser} />
          ) : (
            <Text>Cargando perfil...</Text>
          )}

          {users ? (
            <UserList users={users} onRefresh={onRefresh} />
          ) : (
            <Text>Cargando lista...</Text>
          )}

            
          <ScrollView
            horizontal={true}
            scrollEnabled={false}
          >
            <View style={{ margin: 20,  }}>
              <Button title="Logout" onPress={logout} />
            </View>
            <View style={{ marginTop: 20 }}>
              <Button title="LogoutAll" onPress={logoutAll} />
            </View>

          </ScrollView>
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>  
        
  );
}
