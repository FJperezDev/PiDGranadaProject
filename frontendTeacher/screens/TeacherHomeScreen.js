import React, { useContext, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, useWindowDimensions, Platform } from "react-native";
import { AuthContext } from "../context/AuthContext";
import { useLanguage } from '../context/LanguageContext';
import { COLORS } from "../constants/colors";
import { Users, FileQuestion, BookOpen, BarChart3, UserPlus, ClipboardList } from "lucide-react-native";

export default function UserHomeScreen({ navigation }) {
  const { isSuper, onRefresh } = useContext(AuthContext);
  const { t } = useLanguage();
  const { width } = useWindowDimensions();

  useEffect(() => {
    onRefresh();
  }, []);


  // Botones del menú
  const menuItems = [
    { title: t('manageGroups'), icon: Users, onPress: () => navigation.navigate("ManageGroups") },
    { title: t('manageQuestions'), icon: FileQuestion, onPress: () => navigation.navigate("ManageQuestions") },
    { title: t('manageContent'), icon: BookOpen, onPress: () => navigation.navigate("ManageContent") },
    { title: t('statistics'), icon: BarChart3, onPress: () => navigation.navigate("Analytics") },
    ...(isSuper
      ? [
          { title: t('inviteTeacher'), icon: UserPlus, onPress: () => navigation.navigate("InviteTeacher") },
          { title: t('logs'), icon: ClipboardList, onPress: () => navigation.navigate("BackupManager") },
        ]
      : []),
  ];

  // Cuántas columnas mostrar según el ancho
  const numColumns = width > 1000 ? 3 : width > 600 ? 2 : 1;

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={[styles.container, { maxWidth: width > 600 ? 800 : "100%" }]}>
        <Text style={styles.title}>{t('panel')}</Text>

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
    ...(Platform.OS === 'web'
      ? { boxShadow: '0px 2px 4px rgba(0,0,0,0.1)' }
      : {
          shadowColor: COLORS.black,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        }),
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
    ...(Platform.OS === 'web'
      ? { boxShadow: '0px 1px 3px rgba(0,0,0,0.08)' }
      : {
          shadowColor: COLORS.black,
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.08,
          shadowRadius: 3,
          elevation: 2,
        }),
  },
  menuText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    color: COLORS.text,
  },
});
