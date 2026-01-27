const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

module.exports = function withVoiceNative(config) {
  return withDangerousMod(config, [
    'android',
    async (config) => {
      // 1. Buscamos el archivo MainApplication.kt
      const projectRoot = config.modRequest.platformProjectRoot;
      const appPath = path.join(projectRoot, 'app', 'src', 'main', 'java');
      
      // Buscamos recursivamente porque el paquete com.fran1763... puede variar
      const mainAppFile = findFile(appPath, 'MainApplication.kt');

      if (!mainAppFile) {
        throw new Error("❌ FATAL: No encuentro MainApplication.kt en " + appPath);
      }

      console.log("\n🔍 ANALIZANDO ARCHIVO: " + mainAppFile);
      let contents = fs.readFileSync(mainAppFile, 'utf-8');

      // 2. Inyección del IMPORT
      if (contents.includes('import com.wenkesj.voice.VoicePackage')) {
        console.log("✅ Import ya existe.");
      } else {
        console.log("✏️ Inyectando Import...");
        contents = contents.replace(
          /package (.*)/,
          `package $1\n\nimport com.wenkesj.voice.VoicePackage`
        );
      }

      // 3. Inyección del PAQUETE (La parte crítica)
      // Buscamos "PackageList(this).packages" ignorando espacios
      const regex = /PackageList\s*\(\s*this\s*\)\s*\.\s*packages/g;

      if (contents.includes('VoicePackage()')) {
        console.log("✅ VoicePackage ya está registrado.");
      } else if (regex.test(contents)) {
        console.log("✏️ Inyectando VoicePackage en la lista...");
        // Reemplazamos encontrando el patrón exacto
        contents = contents.replace(
          regex,
          `PackageList(this).packages.apply { add(VoicePackage()) }`
        );
      } else {
        // SI LLEGAMOS AQUÍ, ES EL PROBLEMA
        console.error("\n⚠️⚠️⚠️ ALERTA ROJA ⚠️⚠️⚠️");
        console.error("No encuentro dónde meter 'VoicePackage'.");
        console.error("El contenido del archivo es este:\n");
        console.log(contents); // IMPRIME EL ARCHIVO PARA QUE LO VEAMOS
        console.error("\n----------------------------------\n");
        throw new Error("No se pudo inyectar el código nativo automáticamente.");
      }

      fs.writeFileSync(mainAppFile, contents);
      console.log("✅ MainApplication.kt guardado con éxito.\n");
      return config;
    },
  ]);
};

function findFile(dir, name) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      const found = findFile(filePath, name);
      if (found) return found;
    } else if (file === name) {
      return filePath;
    }
  }
  return null;
}