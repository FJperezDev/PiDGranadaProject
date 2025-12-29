const { withAndroidManifest } = require('@expo/config-plugins');

module.exports = function withManifestFix(config) {
  return withAndroidManifest(config, async (config) => {
    const androidManifest = config.modResults;

    // Asegurarse de que existe la etiqueta <application>
    if (!androidManifest.manifest.application) {
      return config;
    }

    const app = androidManifest.manifest.application[0];

    // 1. Añadir el namespace 'tools' si no existe en la raíz
    if (!androidManifest.manifest.$['xmlns:tools']) {
      androidManifest.manifest.$['xmlns:tools'] = 'http://schemas.android.com/tools';
    }

    // 2. Gestionar tools:replace
    const existingReplace = app.$['tools:replace'];
    let newReplace = 'android:appComponentFactory';

    if (existingReplace) {
      if (!existingReplace.includes('android:appComponentFactory')) {
        newReplace = `${existingReplace},android:appComponentFactory`;
      } else {
        newReplace = existingReplace;
      }
    }
    app.$['tools:replace'] = newReplace;

    // 3. ESTA ES LA CLAVE: Definir explícitamente el valor de AndroidX
    // Esto soluciona el error "no new value specified"
    app.$['android:appComponentFactory'] = 'androidx.core.app.CoreComponentFactory';

    return config;
  });
};