#!/bin/bash
set -e

echo "✨ BUILD FINAL: SOLO AUTOLINKING + LEGACY MODE..."

# 1. Configuración
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk
export PATH=$JAVA_HOME/bin:$PATH
export ANDROID_HOME=/opt/android-sdk
export PATH=$ANDROID_HOME/platform-tools:$PATH

# --- SI NECESITAS LA CLAVE, DESCOMENTA Y PEGA AQUÍ ---
# export EXPO_PUBLIC_KEY_B64="TU_CLAVE_AQUI"

# 2. LIMPIEZA
echo "🧹 Limpiando..."
rm -rf android .expo

# 3. PREBUILD
echo "🏗️  Generando proyecto..."
npx expo prebuild --platform android --clean

# 6. COMPILAR
echo "☕ Compilando APK..."
cd android
./gradlew clean
./gradlew assembleDebug
./gradlew assembleRelease

# Corrección de la ruta en el mensaje final
echo "✅ APK RELEASE LISTO: android/app/build/outputs/apk/release/app-release.apk"
echo "✅ APK DEBUG LISTO: android/app/build/outputs/apk/debug/app-debug.apk"