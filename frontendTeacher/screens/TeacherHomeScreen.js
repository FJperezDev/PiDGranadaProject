import React, { useContext, useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, useWindowDimensions, Platform, Alert, ActivityIndicator } from "react-native";
import { AuthContext } from "../context/AuthContext";
import { useLanguage } from '../context/LanguageContext';
import { COLORS } from "../constants/colors";
import { Users, FileQuestion, BookOpen, BarChart3, UserPlus, ClipboardList, UploadCloud } from "lucide-react-native";
import * as DocumentPicker from 'expo-document-picker';
import { importContentFromExcel } from '../api/backupRequests';
import { StyledButton } from '../components/StyledButton';

export default function UserHomeScreen({ navigation }) {
  const { isSuper, onRefresh } = useContext(AuthContext);
  const { t } = useLanguage();
  const { width } = useWindowDimensions();
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    onRefresh();
  }, []);

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

      const fileToUpload = Platform.OS === 'web' ? file.file : file.uri;

      await importContentFromExcel(fileToUpload, file.name, file.mimeType);
      
      Alert.alert(t('success'), t('importSuccess'));
    } catch (error) {
      console.error(error);
      Alert.alert(t('error'), t('importError'));
    } finally {
      setUploading(false);
    }
  };

  const menuItems = [
    { title: t('manageGroups'), icon: Users, testID:"manageGroupsBtn", onPress: () => navigation.navigate("ManageGroups") },
    { title: t('manageQuestions'), icon: FileQuestion, testID:"manageQuestionsBtn", onPress: () => navigation.navigate("ManageQuestions") },
    { title: t('manageContent'), icon: BookOpen, testID:"manageContentBtn", onPress: () => navigation.navigate("ManageContent") },
    { title: t('statistics'), icon: BarChart3, testID:"statisticsBtn", onPress: () => navigation.navigate("Analytics") },
    ...(isSuper
      ? [
          { title: t('inviteTeacher'), icon: UserPlus, testID:"inviteTeacherBtn", onPress: () => navigation.navigate("InviteTeacher") }, // Corregido a ManageUsers
          { title: t('logs'), icon: ClipboardList, testID:"logsBtn", onPress: () => navigation.navigate("BackupManager") },
          { title: t('importExcel'), icon: UploadCloud, testID:"importExcelBtn", onPress: handleUploadExcel }, 
        ]
      : []),
  ];

  const numColumns = width > 1000 ? 3 : width > 600 ? 2 : 1;

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={[styles.container, { maxWidth: width > 600 ? 900 : "100%" }]}>
        
        <View style={styles.header}>
            <Text style={styles.title}>{t('panel')}</Text>
            <Text style={styles.subtitle}>{t('teachingManagement')}</Text>
        </View>

        {uploading && (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.loadingText}>{t('importing')}</Text>
            </View>
        )}

        <View style={styles.grid}>
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            // Calculamos el ancho restando el gap
            const cardWidth = width > 600 ? `${(100 / numColumns) - 2}%` : "100%";
            
            return (
              <StyledButton
                key={index}
                testID={item.testID}
                onPress={item.onPress}
                disabled={uploading}
                variant="secondary" // Base blanca
                style={[styles.card, { width: cardWidth }]}
              >
                <View style={styles.cardContent}>
                    <View style={styles.iconCircle}>
                        <Icon size={32} color={COLORS.primary} />
                    </View>
                    <Text style={styles.menuText}>{item.title}</Text>
                </View>
              </StyledButton>
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
    padding: 20,
    backgroundColor: COLORS.background,
    alignItems: 'center'
  },
  container: {
    width: "100%",
    alignItems: "stretch",
  },
  header: {
    marginBottom: 30,
    alignItems: 'center'
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: COLORS.text,
    marginBottom: 4,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    fontWeight: '500'
  },
  loadingContainer: {
      marginBottom: 20,
      alignItems: 'center',
      padding: 20,
      backgroundColor: COLORS.surface,
      borderRadius: 12
  },
  loadingText: {
      marginTop: 10, 
      color: COLORS.text,
      fontWeight: '600'
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'center'
  },
  card: {
    height: 160,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    paddingHorizontal: 0, 
    paddingVertical: 0,
    // Sobreescribimos sombras del StyledButton para hacerlas más suaves
    shadowColor: COLORS.primary,
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3
  },
  cardContent: {
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      height: '100%'
  },
  iconCircle: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: COLORS.primaryVeryLight,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 16
  },
  menuText: {
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
    color: COLORS.text,
  },
});