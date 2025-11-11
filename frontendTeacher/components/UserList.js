import { View, Text, StyleSheet, ScrollView } from "react-native";
import UserInfo from "./UserInfo";
import { AuthContext } from './AuthContext';
import { useContext } from "react";

const UserList = ({ users, onRefresh }) => {
  const { isSuperAdmin, isAdmin } = useContext(AuthContext);

  if (!users || users.length === 0) {
    return <Text style={styles.empty}>No hay usuarios disponibles.</Text>;
  }
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.list}>
        {users.map((userData) =>
          ((isAdmin && userData.role === "user") || (isSuperAdmin)) ? (
            <UserInfo
              key={userData.id}
              userData={userData}
              onRefresh={onRefresh}
            />
          ) : null
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#6294ffff",
    borderRadius: 20,
    // maxHeight: Dimensions.get("window").height * 1,
    marginHorizontal: 16,
    padding: 20,
    width: "100%",
  },
  list: {
    paddingVertical: 8,
  },
  empty: {
    padding: 16,
    fontSize: 16,
    textAlign: "center",
    color: "#999",
  },
});

export default UserList;
