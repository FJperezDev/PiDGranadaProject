import forge from 'node-forge';
import { Buffer } from 'buffer';

// Decodificamos de Base64 a string normal PEM
const RAW_KEY = process.env.EXPO_PUBLIC_KEY_B64;

// CAMBIO AQUÍ: 'let' en lugar de 'const' para poder modificarlo abajo
let PUBLIC_KEY_PEM = null; 

if (RAW_KEY) {
  try {
    PUBLIC_KEY_PEM = Buffer.from(RAW_KEY, 'base64').toString('utf-8');
  } catch (error) {
    console.error("Error decoding public key from Base64:", error);
  }
} else {
  console.log("Public key not found in environment variables. Debug Mode");
}

export const encryptPassword = (password) => {
  if (!password) return null;
  
  if (!PUBLIC_KEY_PEM) {
    console.error("Encryption failed: No Public Key available.");
    throw new Error("Security configuration error: Missing Encryption Key");
  }

  try {
    const publicKey = forge.pki.publicKeyFromPem(PUBLIC_KEY_PEM);
    
    // Encriptar usando RSA-OAEP con SHA-256
    const encrypted = publicKey.encrypt(password, 'RSA-OAEP', {
      md: forge.md.sha256.create(),
      mgf1: {
        md: forge.md.sha256.create()
      }
    });

    // Convertir a base64
    return forge.util.encode64(encrypted);
  } catch (error) {
    console.error("Encryption error:", error);
    throw error;
  }
};