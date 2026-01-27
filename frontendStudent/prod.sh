#!/bin/bash
set -e

echo "🚀 INICIANDO BUILD DEFENITIVO (FIX DUPLICATE CLASSES)..."

# 1. Configuración de entorno
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk
export PATH=$JAVA_HOME/bin:$PATH
export ANDROID_HOME=/opt/android-sdk
export PATH=$ANDROID_HOME/platform-tools:$PATH

# 2. Limpieza
echo "🧹 Limpiando..."
rm -rf android .expo

# 3. Generar proyecto nativo
echo "🏗️  Prebuild..."
npx expo prebuild --platform android --clean

# 4. --- PARCHE CRÍTICO: ELIMINAR CLASES DUPLICADAS ---
echo "🩹 Aplicando parche Anti-Duplicados en build.gradle..."

# Añadimos configuración para forzar AndroidX y excluir la librería vieja
cat <<EOF >> android/app/build.gradle

// --- FIX PARA CLASES DUPLICADAS (AndroidX vs Support) ---
configurations.all {
    resolutionStrategy {
        // Forzamos versiones consistentes
        force 'androidx.core:core:1.13.1'
        force 'androidx.versionedparcelable:versionedparcelable:1.1.1'
    }
    // Prohibimos terminantemente las librerías antiguas que causan el conflicto
    exclude group: 'com.android.support', module: 'support-compat'
    exclude group: 'com.android.support', module: 'support-v4'
    exclude group: 'com.android.support', module: 'support-core-utils'
    exclude group: 'com.android.support', module: 'support-core-ui'
    exclude group: 'com.android.support', module: 'support-fragment'
    exclude group: 'com.android.support', module: 'versionedparcelable' 
}
EOF

# 5. Configurar memoria y Jetifier
echo "🔧 Ajustando gradle.properties..."

echo "" >> android/gradle.properties
cat <<EOF >> android/gradle.properties
org.gradle.jvmargs=-Xmx4g -XX:MaxMetaspaceSize=512m
android.useAndroidX=true
android.enableJetifier=true
EOF

# 6. Compilar
echo "☕ Compilando APK Release..."
cd android
./gradlew clean
./gradlew assembleRelease

echo "✅ ¡ÉXITO! APK en: android/app/build/outputs/apk/release/app-release.apk"