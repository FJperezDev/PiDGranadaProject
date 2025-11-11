import React, { useContext, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, useWindowDimensions } from "react-native";
import { AuthContext } from "../components";
import { COLORS } from "../constants/colors";
import { Users, FileQuestion, BookOpen, BarChart3, UserPlus, ClipboardList } from "lucide-react-native";

export default function UserHomeScreen({ navigation }) {
  const { loggedUser, onRefresh } = useContext(AuthContext);
  const { width } = useWindowDimensions();

  useEffect(() => {
    onRefresh();
  }, []);

  // True si el usuario es superadmin o similar
  const isSuper = loggedUser?.is_super;

  // Botones del menú
  const menuItems = [
    { title: "Gestionar Grupos", icon: Users, onPress: () => navigation.navigate("ManageGroups") },
    { title: "Gestionar Preguntas", icon: FileQuestion, onPress: () => navigation.navigate("ManageQuestions") },
    { title: "Gestionar Contenido", icon: BookOpen, onPress: () => navigation.navigate("ManageContent") },
    { title: "Estadísticas", icon: BarChart3, onPress: () => navigation.navigate("Statistics") },
    ...(isSuper
      ? [
          { title: "Invitar Profesor", icon: UserPlus, onPress: () => navigation.navigate("InviteTeacher") },
          { title: "Ver Logs (Auditoría)", icon: ClipboardList, onPress: () => navigation.navigate("Logs") },
        ]
      : []),
  ];

  // Cuántas columnas mostrar según el ancho
  const numColumns = width > 1000 ? 3 : width > 600 ? 2 : 1;

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={[styles.container, { maxWidth: width > 600 ? 800 : "100%" }]}>
        <Text style={styles.title}>Panel del Profesor</Text>

        <View
          style={[
            styles.menuGrid,
            {
              flexDirection: width < 600 ? "column" : "row",
              flexWrap: width > 600 ? "wrap" : "nowrap",
            },
          ]}
        >
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.menuButton,
                  { width: width > 600 ? `${100 / numColumns - 4}%` : "100%" },
                ]}
                activeOpacity={0.8}
                onPress={item.onPress}
              >
                <Icon size={40} color={COLORS.primaryDark || COLORS.primary} />
                <Text style={styles.menuText}>{item.title}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: COLORS.background || "#f7f9fa",
  },
  container: {
    width: "100%",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 24,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 20,
    textAlign: "center",
  },
  menuGrid: {
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  menuButton: {
    backgroundColor: COLORS.primaryLight || "#e0f7fa",
    borderWidth: 1,
    borderColor: COLORS.secondary || "#b2ebf2",
    borderRadius: 14,
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    margin: 6,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  menuText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    color: COLORS.text,
  },
});
