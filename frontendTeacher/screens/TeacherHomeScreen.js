import React, { useContext, useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, useWindowDimensions, Platform, Alert, ActivityIndicator } from "react-native";
import { AuthContext } from "../context/AuthContext";
import { useLanguage } from '../context/LanguageContext';
import { COLORS } from "../constants/colors";
import { Users, FileQuestion, BookOpen, BarChart3, UserPlus, ClipboardList, UploadCloud } from "lucide-react-native";
import * as DocumentPicker from 'expo-document-picker';
import { importContentFromExcel } from '../api/backupRequests'; // Asegúrate de la ruta correcta

export default function UserHomeScreen({ navigation }) {
  const { isSuper, onRefresh } = useContext(AuthContext);
  const { t } = useLanguage();
  const { width } = useWindowDimensions();
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    onRefresh();
  }, []);

  // Función para manejar la subida del Excel
  const handleUploadExcel = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", 
            "application/vnd.ms-excel"
        ],
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const file = result.assets[0];
      setUploading(true);

      // En web 'file.file' es el objeto File real, en móvil usamos uri
      const fileToUpload = Platform.OS === 'web' ? file.file : file.uri;

      await importContentFromExcel(fileToUpload, file.name, file.mimeType);
      
      Alert.alert(t('success') || "Éxito", "Contenido importado correctamente.");
    } catch (error) {
      console.error(error);
      Alert.alert(t('error') || "Error", "Fallo al importar el contenido.");
    } finally {
      setUploading(false);
    }
  };

  const menuItems = [
    { title: t('manageGroups'), icon: Users, onPress: () => navigation.navigate("ManageGroups") },
    { title: t('manageQuestions'), icon: FileQuestion, onPress: () => navigation.navigate("ManageQuestions") },
    { title: t('manageContent'), icon: BookOpen, onPress: () => navigation.navigate("ManageContent") },
    { title: t('statistics'), icon: BarChart3, onPress: () => navigation.navigate("Analytics") },
    ...(isSuper
      ? [
          { title: t('inviteTeacher'), icon: UserPlus, onPress: () => navigation.navigate("InviteTeacher") },
          { title: t('logs'), icon: ClipboardList, onPress: () => navigation.navigate("BackupManager") },
          // Nuevo botón para cargar excel
          { title: "Cargar Excel", icon: UploadCloud, onPress: handleUploadExcel }, 
        ]
      : []),
  ];

  const numColumns = width > 1000 ? 3 : width > 600 ? 2 : 1;

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={[styles.container, { maxWidth: width > 600 ? 800 : "100%" }]}>
        <Text style={styles.title}>{t('panel')}</Text>

        {uploading && (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={{marginTop: 10}}>Importando datos...</Text>
            </View>
        )}

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
                disabled={uploading}
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
  loadingContainer: {
      marginBottom: 20,
      alignItems: 'center'
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