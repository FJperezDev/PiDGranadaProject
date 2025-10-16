Para permitir acceso exclusivo a la api por la aplicacion de desarrollo, modificar backend/settings.py

comentar estas lineas

RENDER_EXTERNAL_HOSTNAME = os.environ.get('RENDER_EXTERNAL_HOSTNAME') 
if RENDER_EXTERNAL_HOSTNAME:
    ALLOWED_HOSTS.append(RENDER_EXTERNAL_HOSTNAME)

y agregar lo siguiente

ALLOWED_HOSTS.append("MyAppHost")
