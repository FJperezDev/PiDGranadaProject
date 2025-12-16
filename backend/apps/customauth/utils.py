import base64
from cryptography.hazmat.primitives import serialization, hashes
from cryptography.hazmat.primitives.asymmetric import padding
from django.conf import settings

def decrypt_rsa_password(encrypted_password):
    if not encrypted_password:
        return None
    
    # Bypass para DEBUG
    if settings.DEBUG and len(encrypted_password) < 50:
        return encrypted_password

    try:
        # 1. Obtener clave privada
        private_key_b64 = settings.RSA_PRIVATE_KEY
        
        # Limpieza básica por si viene con headers o espacios
        private_key_b64 = private_key_b64.replace("-----BEGIN PRIVATE KEY-----", "").replace("-----END PRIVATE KEY-----", "").replace("\n", "").strip()
        
        try:
            private_key_bytes = base64.b64decode(private_key_b64)
        except:
            # Si falla el decode, asumimos que settings lo cargó mal o ya eran bytes
            private_key_bytes = settings.RSA_PRIVATE_KEY.encode('utf-8')

        private_key = serialization.load_der_private_key(private_key_bytes, password=None)
        # Si load_der falla, intenta load_pem (depende de cómo generaste la clave)
        # private_key = serialization.load_pem_private_key(private_key_bytes, password=None)

    except Exception as e:
        # Fallback: intentar cargar como PEM si DER falla
        try:
            private_key_bytes = base64.b64decode(private_key_b64)
            private_key = serialization.load_pem_private_key(private_key_bytes, password=None)
        except Exception as e2:
            print(f"❌ Error cargando Clave Privada: {e2}")
            return None

    # 2. Desencriptar
    try:
        ciphertext = base64.b64decode(encrypted_password)
    except:
        print("❌ Error: El password no es base64 válido")
        return None

    # INTENTO 1: Padding OAEP (Más seguro, usado por crypto-js/forge modernos)
    try:
        decrypted = private_key.decrypt(
            ciphertext,
            padding.OAEP(
                mgf=padding.MGF1(algorithm=hashes.SHA256()),
                algorithm=hashes.SHA256(),
                label=None
            )
        )
        return decrypted.decode('utf-8')
    except Exception:
        # Si falla OAEP, intentamos PKCS1v15
        pass

    # INTENTO 2: Padding PKCS1v15 (Usado por JSEncrypt y librerías antiguas/compatibles)
    try:
        decrypted = private_key.decrypt(
            ciphertext,
            padding.PKCS1v15()
        )
        return decrypted.decode('utf-8')
    except Exception as e:
        print(f"❌ Decryption error (final): {e}")
        return None
