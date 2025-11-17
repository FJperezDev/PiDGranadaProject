import { Image, View, Text, StyleSheet, Platform } from "react-native";
import { useState } from "react";
import { StyledButton } from "../components/StyledButton";
import { useLanguage } from "../context/LanguageContext";
import { GAME_SOLUTION } from "../constants/game";
import { useMemo } from "react";

export const GameResultScreen = ({ route }) => {
  const { t, language } = useLanguage();
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

    // Regla especial: si aparece el 6 en los primeros 2 → devolver solo "6"
    if (sorted[0]?.code === 6 || sorted[1]?.code === 6) {
      return "6";
    }

    const freq = sorted.slice(0, 3).map(x => x.code);
    return freq.join("");
  }, [codeCounts]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t("gameResultTitle")}</Text>

      <StyledButton onPress={() => setImageVisible(true)} style={styles.imageButton}>
        {imageVisible ? (
          <Image
            source={{
              uri: GAME_SOLUTION[language][topThreeCodes]?.urlImage || GAME_SOLUTION[language][0]?.urlImage,
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
          <Text style={styles.revealedText}>{GAME_SOLUTION[language][topThreeCodes]?.text || t("noResult")}
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
    backgroundColor: "#ffffff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000000",
    marginBottom: 32,
  },
  imageButton: {
    width: 256, // equivalente a w-64
    height: 256, // equivalente a h-64
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    ...(Platform.OS === 'web'
      ? { boxShadow: '0px 3px 4px rgba(0,0,0,0.2)' }
      : {
          shadowColor: "#000",
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
    backgroundColor: "#cbd5e1", // slate-300
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderText: {
    fontSize: 18,
    color: "#000",
  },
  nameButton: {
    marginTop: 32, // mt-8
    alignItems: "center",
    justifyContent: "center",
  },
  revealedText: {
    alignContent: "center",
    textAlign: "center",
    fontSize: 28, // text-3xl
    fontWeight: "bold",
    color: "#000",
  },
  namePlaceholder: {
    backgroundColor: "#cbd5e1", // slate-300
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16, // py-4
    paddingHorizontal: 32, // px-8
  },
});
