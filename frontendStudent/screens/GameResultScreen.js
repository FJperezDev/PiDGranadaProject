import { Image, View, Text, StyleSheet } from "react-native";
import { useState } from "react";
import { StyledButton } from "../components/StyledButton";
import { useLanguage } from "../context/LanguageContext";

export const GameResultScreen = ( ) => {
  const { t } = useLanguage();
  const [imageVisible, setImageVisible] = useState(false);
  const [nameVisible, setNameVisible] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t("gameResultTitle")}</Text>

      {/* Imagen Oculta */}
      <StyledButton onPress={() => setImageVisible(true)} style={styles.imageButton}>
        {imageVisible ? (
          <Image
            source={{
              uri: "https://placehold.co/300x300/E0F7FA/000000?text=Organization+Chart",
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
          <Text style={styles.revealedText}>Estructura Matricial</Text>
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
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 4,
    elevation: 4,
    alignItems: "center",
    justifyContent: "center",
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
