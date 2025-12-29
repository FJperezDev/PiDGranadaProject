const { withProjectBuildGradle, withAppBuildGradle } = require('@expo/config-plugins');

module.exports = function withDependencyFix(config) {
  
  // PARTE 1: Arreglar Clases Duplicadas (Nivel Proyecto)
  config = withProjectBuildGradle(config, (config) => {
    if (config.modResults.language === 'groovy') {
      const gradleFix = `
// --- FIX DUPLICATE CLASSES ---
allprojects {
    configurations.all {
        // Bloquear librerías Legacy que chocan con AndroidX
        exclude group: 'com.android.support', module: 'support-compat'
        exclude group: 'com.android.support', module: 'support-v4'
        exclude group: 'com.android.support', module: 'support-media-compat'
        exclude group: 'com.android.support', module: 'versionedparcelable'
        
        // Forzar versiones modernas si hay conflicto
        resolutionStrategy {
            force 'androidx.localbroadcastmanager:localbroadcastmanager:1.0.0'
            force 'androidx.customview:customview:1.1.0'
        }
    }
}
// -----------------------------
      `;
      
      if (!config.modResults.contents.includes('exclude group: \'com.android.support\'')) {
        config.modResults.contents += gradleFix;
      }
    }
    return config;
  });

  // PARTE 2: Arreglar Archivos Duplicados META-INF (Nivel App)
  // Aquí usamos el comodín para matar todos los errores futuros de este tipo
  config = withAppBuildGradle(config, (config) => {
    if (config.modResults.language === 'groovy') {
      const packagingOptions = `
    packagingOptions {
        // Ignorar cualquier archivo de versión duplicado de AndroidX
        pickFirst 'META-INF/androidx.*'
        pickFirst 'META-INF/proguard/*'
        
        // Reglas específicas que ya sabemos que fallan
        pickFirst 'META-INF/androidx.localbroadcastmanager_localbroadcastmanager.version'
        pickFirst 'META-INF/androidx.customview_customview.version'
        pickFirst 'META-INF/ASL2.0'
        pickFirst 'META-INF/yb_android_release.kotlin_module'
    }
      `;

      // Inserción segura dentro de android { ... }
      if (!config.modResults.contents.includes('pickFirst \'META-INF/androidx.localbroadcastmanager')) {
        config.modResults.contents = config.modResults.contents.replace(
          'android {',
          `android { ${packagingOptions}`
        );
      }
    }
    return config;
  });

  return config;
};