import base64
from cryptography.hazmat.primitives import serialization, hashes
from cryptography.hazmat.primitives.asymmetric import padding
from django.conf import settings

def decrypt_rsa_password(encrypted_password):
    """
    Desencripta la contraseña si no estamos en DEBUG.
    Si estamos en DEBUG, asume que viene en texto plano (o manéjalo según tu flujo).
    """
    if not encrypted_password:
        return None
    # Si estás en modo local y decides enviar texto plano para probar rápido:
    if settings.DEBUG:
        return encrypted_password

    try:
        private_key_pem = settings.RSA_PRIVATE_KEY.encode('utf-8')
        private_key = serialization.load_pem_private_key(private_key_pem, password=None)

        ciphertext = base64.b64decode(encrypted_password)

        decrypted_bytes = private_key.decrypt(
            ciphertext,
            padding.OAEP(
                mgf=padding.MGF1(algorithm=hashes.SHA256()),
                algorithm=hashes.SHA256(),
                label=None
            )
        )
        return decrypted_bytes.decode('utf-8')
    except Exception as e:
        print(f"Decryption error: {e}")
        return None # O lanza una excepción personalizada