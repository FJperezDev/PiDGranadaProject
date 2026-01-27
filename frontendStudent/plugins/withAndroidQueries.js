const { withAndroidManifest } = require('@expo/config-plugins');

const withAndroidQueries = (config) => {
  return withAndroidManifest(config, async (config) => {
    const androidManifest = config.modResults;

    // Aseguramos que exista la sección 'queries'
    if (!androidManifest.manifest.queries) {
      androidManifest.manifest.queries = [];
    }

    // Añadimos el paquete de Google (que es quien hace el reconocimiento de voz)
    // para que sea visible por nuestra app
    const googlePackageName = 'com.google.android.googlequicksearchbox';
    
    // Evitamos duplicados por si acaso
    const existingQuery = androidManifest.manifest.queries.find(
      (q) => q.package && q.package[0]['$']['android:name'] === googlePackageName
    );

    if (!existingQuery) {
      androidManifest.manifest.queries.push({
        package: [{ $: { 'android:name': googlePackageName } }],
      });
      
      // También añadimos intent genérico por si el usuario usa otro motor (Samsung, etc)
      androidManifest.manifest.queries.push({
        intent: [{
            action: [{ $: { 'android:name': 'android.speech.RecognitionService' } }]
        }]
      });
    }

    return config;
  });
};

module.exports = withAndroidQueries;