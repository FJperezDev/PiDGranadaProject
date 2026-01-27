import { Image, View, Text, StyleSheet, Platform } from "react-native";
import { useState, useEffect } from "react";
import { StyledButton } from "../components/StyledButton";
import { useLanguage } from "../context/LanguageContext";
import { GAME_SOLUTION } from "../constants/game";
import { useMemo } from "react";
import { useVoiceControl } from "../context/VoiceContext";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { COLORS } from "../constants/colors";

export const GameResultScreen = ({ route }) => {
  const { t, language } = useLanguage();
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const { transcript, setTranscript } = useVoiceControl();
  const [imageVisible, setImageVisible] = useState(false);
  const [nameVisible, setNameVisible] = useState(false);
  const { codeCounts } = route.params;

  const topThreeCodes = useMemo(() => {
    if (!Array.isArray(codeCounts)) return "";

    const sorted = codeCounts
      .map((count, code) => ({ code, count }))
      .filter(x => x.count > 0)
      .sort((a, b) => b.count - a.count);

    if (sorted.length === 0) return "";

    if (sorted[0]?.code === 6 || sorted[1]?.code === 6) {
      return "6";
    }

    const freq = sorted.slice(0, 3).map(x => x.code);
    return freq.join("");
  }, [codeCounts]);

  const normalizeText = (text) => {
    return text ? text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim() : "";
  };

  useEffect(() => {
    if (!transcript || !isFocused) return;

    const spoken = normalizeText(transcript);
    
    if (
        spoken.includes('imagen') || 
        spoken.includes('foto') || 
        spoken.includes('ver') || 
        spoken.includes('revelar') ||
        spoken.includes('image') ||
        spoken.includes('show')
    ) {
        setImageVisible(true);
        setTranscript('');
        return;
    }

    if (
        spoken.includes('nombre') || 
        spoken.includes('texto') || 
        spoken.includes('resultado') || 
        spoken.includes('solucion') ||
        spoken.includes('name') ||
        spoken.includes('text')
    ) {
        setNameVisible(true);
        setTranscript('');
        return;
    }

    if (spoken.includes('inicio') || spoken.includes('home') || spoken.includes('salir')) {
        navigation.navigate('Home');
        setTranscript('');
        return;
    }

    if (spoken.includes('volver') || spoken.includes('atras') || spoken.includes('back')) {
        if (navigation.canGoBack()) navigation.goBack();
        setTranscript('');
        return;
    }

  }, [transcript, isFocused, navigation]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t("gameResultTitle")}</Text>

      <StyledButton onPress={() => setImageVisible(true)} style={styles.imageButton}>
        {imageVisible ? (
          <Image
            source={{
              uri: GAME_SOLUTION[language][topThreeCodes]?.urlImage || GAME_SOLUTION[language][0]?.urlImage,
              cache: 'force-cache',
            }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.placeholderText}>{t("tapToReveal")}</Text>
          </View>
        )}
      </StyledButton>

      {/* Nombre Oculto */}
      <StyledButton onPress={() => setNameVisible(true)} style={styles.nameButton}>
        {nameVisible ? (
          <Text style={styles.revealedText}>{GAME_SOLUTION[language][topThreeCodes]?.text || t("gameResultTitle")}
          </Text>
        ) : (
          <View style={styles.namePlaceholder}>
            <Text style={styles.placeholderText}>{t("tapToReveal")}</Text>
          </View>
        )}
      </StyledButton>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: COLORS.surface,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 32,
  },
  imageButton: {
    width: 256, 
    height: 256, 
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: 'transparent',
    paddingHorizontal: 0, 
    paddingVertical: 0,
    ...(Platform.OS === 'web'
      ? { boxShadow: '0px 3px 4px rgba(0,0,0,0.2)' }
      : {
          shadowColor: COLORS.shadow,
          shadowOpacity: 0.2,
          shadowOffset: { width: 0, height: 3 },
          shadowRadius: 4,
          elevation: 4,
        }),
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 12,
  },
  imagePlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: COLORS.border,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderText: {
    fontSize: 18,
    color: COLORS.text,
  },
  nameButton: {
    marginTop: 32,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: 'transparent',
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  revealedText: {
    alignContent: "center",
    textAlign: "center",
    fontSize: 28,
    fontWeight: "bold",
    color: COLORS.text,
  },
  namePlaceholder: {
    backgroundColor: COLORS.border,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
});