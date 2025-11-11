import { useState, useEffect } from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
  TextInput,
  Button,
  ScrollView,
} from "react-native";
import { getUserInfo, updateUserInfo } from "../api";
import { Picker } from "@react-native-picker/picker";
import { AuthContext } from "./AuthContext";
import { useContext } from "react";

const UserInfo = ({ userData, onRefresh }) => {
  const { isSuperAdmin } = useContext(AuthContext);

  if (!userData) {
    return <Text>Cargando...</Text>;
  }

  let activeOpacity = 0.6;
  if(!onRefresh)
    activeOpacity = 1;
  const [canEdit, setCanEdit] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState(userData?.role || "user");

  useEffect(() => {
    if (userData) {
      setUsername(userData.username);
      setEmail(userData.email);
      setRole(userData.role);
    }
  }, [userData]);

  const toggleCanEdit = () => {
    if (!canEdit) {
      setUsername(userData.username);
      setEmail(userData.email);
    }
    setCanEdit((prev) => !prev);
  };

  const handleEdit = async () => {
    const data = await getUserInfo(userData.id);
    data.username = username;
    data.email = email;
    data.role = role;
    const updatedUser = await updateUserInfo(data);
    if (onRefresh) onRefresh();
    setCanEdit(false);
  };

  return (
    <View style={styles.wrapper}>
      <TouchableOpacity
        style={styles.container}
        activeOpacity={activeOpacity}
        accessibilityHint="user page"
        onPress={toggleCanEdit}
      >
        <Text style={styles.name}>👤 {userData.username}</Text>
        <Text style={styles.email}>📧 {userData.email}</Text>
        <Text style={styles.role}>🔐 Rol: {userData.role}</Text>
      </TouchableOpacity>

      { onRefresh && canEdit && (
        <View style={styles.container}>
          <ScrollView
            horizontal={true}
            contentContainerStyle={styles.row}
            scrollEnabled={false}
          >
            <View style={styles.inputsContainer}>
              <TextInput
                style={styles.input}
                placeholder="Username"
                value={username}
                onChangeText={setUsername}
              />

              <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            
            { isSuperAdmin && (<View style={styles.pickerContainer}>
              <Picker
                selectedValue={role}
                onValueChange={(itemValue) => setRole(itemValue)}
                style={styles.picker}
                mode="dropdown"
              >
                <Picker.Item label="User" value="user" />
                <Picker.Item label="Admin" value="admin" />
                <Picker.Item label="Superadmin" value="superadmin" />

              </Picker>
            </View>)}

          </ScrollView>

          <Button title="Guardar cambios" onPress={handleEdit} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: { marginBottom: 10 },
  container: {
    padding: 10,
    backgroundColor: "#62ff91ff",
    borderRadius: 20,
    margin: 10,
    elevation: 2,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    marginTop: 12,
    borderRadius: 6,
    width: "100%"
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
    padding: 2,
  },
  email: {
    fontSize: 14,
    color: "#333",
    padding: 2,
  },
  role: {
    fontSize: 14,
    color: "#666",
    padding: 2,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  inputsContainer: {
    flex: 1,
    marginRight: 5,
    marginBottom: 10,
  },
  pickerContainer: {
    marginLeft: 5,
    width: 120,
  },
  picker: {
    // width: "75%",
    // height: 50,  // si quieres ajustar alto del picker
  },
});

export default UserInfo;
