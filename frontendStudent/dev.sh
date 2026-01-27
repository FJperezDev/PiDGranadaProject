#!/bin/bash
set -e

echo "✨ BUILD FINAL: SOLO AUTOLINKING + LEGACY MODE..."

# 1. Configuración
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk
export PATH=$JAVA_HOME/bin:$PATH
export ANDROID_HOME=/opt/android-sdk
export PATH=$ANDROID_HOME/platform-tools:$PATH

# 2. LIMPIEZA (Borramos para quitar las inyecciones manuales anteriores)
echo "🧹 Limpiando..."
rm -rf android .expo

# 3. PREBUILD (Expo generará MainApplication.kt limpio, con Autolinking nativo)
echo "🏗️  Generando proyecto..."
npx expo prebuild --platform android --clean

# ---------------------------------------------------------
# 4. CONFIGURACIÓN CRÍTICA (Desactivar New Arch)
# ---------------------------------------------------------
echo "🔧 Desactivando Nueva Arquitectura (Vital)..."
PROP_FILE="android/gradle.properties"

echo "" >> "$PROP_FILE"
echo "newArchEnabled=false" >> "$PROP_FILE" 
echo "android.useAndroidX=true" >> "$PROP_FILE"
echo "android.enableJetifier=true" >> "$PROP_FILE"
echo "org.gradle.jvmargs=-Xmx4g -XX:MaxMetaspaceSize=512m" >> "$PROP_FILE"

# ---------------------------------------------------------
# 5. PARCHE ANTI-DUPLICADOS (Siempre necesario)
# ---------------------------------------------------------
echo "🩹 Parcheando dependencias..."
cat <<EOF >> android/app/build.gradle
configurations.all {
    resolutionStrategy {
        force 'androidx.core:core:1.13.1'
        force 'androidx.versionedparcelable:versionedparcelable:1.1.1'
    }
    exclude group: 'com.android.support'
}
EOF

# ---------------------------------------------------------
# 6. COMPILAR
# ---------------------------------------------------------
echo "☕ Compilando APK Debug..."
cd android
./gradlew clean
./gradlew assembleRelease

echo "✅ APK FINAL LISTO: android/app/build/outputs/apk/debug/app-debug.apk"